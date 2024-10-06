using FinanceApp.Dto;
using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class PaymentRepo : IPaymentRepo
		{
				private readonly AppDbContext _context;
				private readonly ILoanRepo _loan;

				public PaymentRepo(AppDbContext context, ILoanRepo loan)
        {
            _context = context;
						_loan = loan; 
						
        }

				public decimal ComputeInterestPercent(LoanProfile loanProfile, DateTime startDate,  DateTime date)
				{
						double days = (date - startDate).TotalDays;
						loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
						var sort = loanProfile.Fixed;
						int useIndex = sort.FindIndex(e => e.MaxDays > days);

						if (useIndex > -1) return sort[useIndex].Interest;

						DateTime nextDate = startDate;
						decimal totalInterest = 0;
						while (nextDate < date)
						{
								nextDate = nextDate.AddMonths(1);
								totalInterest = totalInterest + loanProfile.InterestPerMonth;
						}


						if (loanProfile.ComputePerDay && date < nextDate)
						{

								int noOfDaysInMonth = nextDate.AddMonths(1).AddDays(-1).Day;
								int rebateDays = (nextDate - date).Days;
								decimal percent = (rebateDays / noOfDaysInMonth) * loanProfile.InterestPerMonth;
								totalInterest = totalInterest - percent;
						}

						return totalInterest;
				}


				public async Task ApplyPayment(PaymentRecord record)
				{
						//get and remove affected payments


						await _context.Payments!.AddAsync(record);
						List<LoanPayment> payment = await _context.LoanPayments!.Where(e => e.AppId == record.AppId && e.Date >= record.Date && e.UserId == record.UserId).ToListAsync();
						payment.ForEach(e=>_context.Remove(e));
						await _context.SaveChangesAsync();


						//get and update affected loans (for interest recalculation)
						List<Loans> affectedLoans = await _context.Loans!.Where(e => e.AppId == record.AppId && e.UserId == record.UserId && e.LastInterestDate > record.Date)
								.ToListAsync();
						//rollback Interest charging
						affectedLoans.ForEach(loan =>
						{
								var lastToRetain = loan.InterestRecords.Where(e => e.DateStart <= record.Date).OrderByDescending(e => e.DateStart)
										.FirstOrDefault();
								if(lastToRetain == null)
								{
										loan.LastInterestDate = loan.Date;
										loan.NextInterestDate = loan.Date;
										
								}
								else{
										var loanProfile = loan.LoanProfile;
										loan.TotalInterestPercent = ComputeInterestPercent(loanProfile, loan.Date, lastToRetain.DateEnd);
										if (loanProfile.ComputePerDay)
										{
												var days = (loan.Date - lastToRetain.DateEnd).TotalDays;
												loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
												var sort = loanProfile.Fixed;
												int useIndex = sort.FindIndex(e => e.MaxDays > days);
												loan.LastInterestDate = lastToRetain.DateEnd;
												loan.NextInterestDate = useIndex > -1 ? loan.Date.AddDays(sort[useIndex].MaxDays) : lastToRetain.DateEnd.AddMonths(1);
										}
										else{
												loan.LastInterestDate = lastToRetain.DateStart;
												loan.NextInterestDate = lastToRetain.DateEnd;
										}


								} 
								var interestToRemove = loan.InterestRecords.Where(e => e.DateStart > record.Date).ToList();

								loan.Status = "Active";

								interestToRemove.ForEach(e => {
										loan.InterestRecords.Remove(e);
								});


						});
						await _context.SaveChangesAsync();
						List<PaymentRecord> records = await _context.Payments!.Where(e => e.AppId == record.AppId && e.Date >= record.Date && e.UserId == record.UserId).ToListAsync();

						List<Loans> loansToApply = await _context.Loans!.Where(e=> e.AppId == record.AppId && e.UserId == record.UserId && e.Status == "Active")
							
								.OrderByDescending(e=>e.LoanProfile.InterestPerMonth)
								.OrderBy(e=>e.Date).ToListAsync();

						int paymentIndex = 0;
						PaymentRecord currentPayment = records[paymentIndex];
						decimal paymentBalance = currentPayment.Amount;

						loansToApply.ForEach(loan =>
						{

								if (records.Count() < paymentIndex)
								{
										_loan.ComputeInterests(loan, DateTime.Now);
										return;
								};
								//add interest prior payment
								DateTime nextDate = loan.NextInterestDate;
								var updatedLoan = loan;
								while (nextDate < currentPayment.Date)
								{
										var result = _loan.ComputeInterests(updatedLoan, currentPayment.Date, true).GetAwaiter().GetResult();
										nextDate = result.NextDate;
										updatedLoan = result.NewLoanData;
								}
								//apply payment
								decimal currentPayments = updatedLoan.Payment.Where(e=>e.AgainstPrincipal == true).Sum(e => e.Amount);
								decimal currentBalance = updatedLoan.Principal - currentPayments;
								 updatedLoan.Interests = updatedLoan.InterestRecords.Sum(e => e.Amount);
								while(paymentBalance > 0 && currentBalance > 0)
								{

										if (updatedLoan.Interests > 0 && paymentBalance > 0)
										{
												if (updatedLoan.Interests < paymentBalance)
												{
														_context.LoanPayments.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																Amount = updatedLoan.Interests,
																AgainstPrincipal = false,
																PaymentId = currentPayment.Id,
																LoanId = loan.Id,
																AppId = loan.AppId
														});
														paymentBalance = paymentBalance - updatedLoan.Interests;
														updatedLoan.Interests = 0;
												}
												else
												{
														_context.LoanPayments.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																Amount = paymentBalance,
																AgainstPrincipal = false,
																PaymentId = currentPayment.Id,
																LoanId = loan.Id,
																AppId = loan.AppId
														});
														updatedLoan.Interests = updatedLoan.Interests - paymentBalance;
														paymentBalance = 0;
												}

										}

										if (paymentBalance > 0 && currentBalance > 0)
										{
												if (currentBalance < paymentBalance)
												{
														_context.LoanPayments!.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																AppId = loan.AppId,
																UserId = loan.UserId,
																Amount = currentBalance,
																AgainstPrincipal = true,
																Payment = currentPayment,
																Loan = loan
														});
														paymentBalance = paymentBalance - currentBalance;
														currentBalance = 0;
												}
												else
												{
														_context.LoanPayments!.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																Amount = paymentBalance,
																AgainstPrincipal = true,
																UserId = loan.UserId,
																PaymentId = currentPayment.Id,
																LoanId = loan.Id,
																AppId=loan.AppId
														});
														paymentBalance = 0;
														currentBalance = currentBalance - paymentBalance;

												}
												if(currentBalance > 0)
												{
														paymentIndex = paymentIndex + 1;
														if (records.Count() < paymentIndex)
														{
																PaymentRecord currentPayment = records[paymentIndex];
																decimal paymentBalance = currentPayment.Amount;
														}
												}
										}
								}


								if (currentBalance == 0) {
										updatedLoan.Status = "Closed";
								}
								else
								{
										_loan.ComputeInterests(updatedLoan, DateTime.Now);
								}


								_context.Loans!.Update(updatedLoan);

								_context.SaveChangesAsync().Wait();

						});





				}

		}                                               
}
