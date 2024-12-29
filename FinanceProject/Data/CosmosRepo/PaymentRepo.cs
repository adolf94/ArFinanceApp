using FinanceApp.Models;
using FinanceApp.Models.SubModels;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo;

public class PaymentRepo : IPaymentRepo
{
		private readonly AppDbContext _context;
		private readonly ILoanRepo _loan;
		private readonly ILedgerEntryRepo _ledger;

		public PaymentRepo(AppDbContext context, ILoanRepo loan, ILedgerEntryRepo ledger)
		{
				_context = context;
				_loan = loan;
				_ledger = ledger;
		}


		public List<LoanPayment> GetByLoanId(Guid loanId)
		{
				return _context.LoanPayments!.Where(e => e.LoanId == loanId).ToListAsync().GetAwaiter().GetResult();
		}

		public async Task ApplyPayment(PaymentRecord record)
		{
				//get and remove affected payments


				await _context.Payments!.AddAsync(record);
				//List<LoanPayment> payment = await _context.LoanPayments!.Where(e => e.AppId == record.AppId && e.Date >= record.Date && e.UserId == record.UserId).ToListAsync();
				//payment.ForEach(e => _context.Remove(e));
				var user = await _context.Users!.Where(e=>e.Id == record.UserId).Select(e=> new {e.AcctReceivableId, e.Name}).FirstAsync();
				
				LedgerEntry entry = new LedgerEntry()
				{
					AddedBy = record.AddedBy!.Value,
					Date = record.Date,
					Amount = record.Amount,
					DebitId = record.DestinationAcctId,
					CreditId =  user.AcctReceivableId!.Value,
					DateAdded = DateTime.Now,
					MonthGroup = record.Date.ToString("yyyy-MM"),
					Description = $"Received payment from Client {user.Name}",
					EntryId = record.LedgerEntryId,
					RelatedEntries = [new LedgerEntryTransaction{TransactionId = record.Id, Type = EntryTransactionTypes.Payment}],

					EntryGroupId = record.LedgerEntryId					
				};
				await _ledger.CreateAsync(entry,false);
				await _context.SaveChangesAsync();


				//get and update affected loans (for interest recalculation)
				var affectedLoans = await _context.Loans!.Where(e =>
						e.AppId == record.AppId && e.UserId == record.UserId && e.NextInterestDate > record.Date)
					.ToListAsync();
				//rollback Interest charging
				affectedLoans.ForEach(loan =>
				{
						var lastToRetain = loan.InterestRecords.Where(e => e.DateEnd < record.Date)
					.OrderByDescending(e => e.DateStart)
					.ThenByDescending(e => e.DateEnd)
					.FirstOrDefault();
						if (lastToRetain == null)
						{
								loan.LastInterestDate = loan.Date;
								loan.NextInterestDate = loan.Date;
								loan.NextComputeDate = loan.Date;
								loan.TotalInterestPercent = 0;
						}
						else
						{
								var loanProfile = loan.LoanProfile!;
								loan.TotalInterestPercent = lastToRetain.TotalPercent;
								loan.LastInterestDate = lastToRetain.DateStart;
								loan.NextInterestDate = lastToRetain.DateEnd;
								loan.NextComputeDate = loanProfile.ComputePerDay
							? lastToRetain.DateEnd.AddMonths(1)
							: lastToRetain.DateEnd;
								// }
						}

						var interestToRemove = loan.InterestRecords.Where(e => e.DateEnd >= record.Date).ToList();

						loan.Status = "Active";

						interestToRemove.ForEach(e =>
						{
							_ledger.ReverseEntry(e.LedgerEntryId, false).Wait();
							loan.InterestRecords.Remove(e);
						});
				});
				await _context.SaveChangesAsync();

				// ReSharper disable once EntityFramework.NPlusOne.IncompleteDataQuery
				var loansToApply = await _context.Loans!.Where(e => e.AppId == record.AppId && e.UserId == record.UserId)
					.ToListAsync();

				loansToApply = loansToApply
					.OrderByDescending(e => e.LoanProfile.InterestPerMonth)
					.ThenBy(e => e.Date).ToList();

				//int paymentIndex = 0;
				//PaymentRecord currentPayment = records[paymentIndex];
				//decimal paymentBalance = currentPayment.Amount;
				var loansAffectedCount = loansToApply.Count();
				for (var loanIndex = 0; loanIndex < loansAffectedCount; loanIndex++)
				{
						var loan = loansToApply[loanIndex];

						var appliedPayments = await _context.LoanPayments!

																	.Where(e => e.AppId == record.AppId
																																					&& e.Date >= record.Date &&
																																					e.LoanId == loan.Id).ToListAsync();
						appliedPayments.ForEach(e => _context.Remove(e));
						await _context.SaveChangesAsync();
				}

				var records = _context.Payments!.Where(e => e.AppId == record.AppId
																										&& e.Date >= record.Date && e.UserId == record.UserId)
					.ToListAsync()
					.GetAwaiter().GetResult();
				records = records.OrderBy(e => e.Date).ToList();


				var paymentIndex = 0;


				for (var loanIndex = 0; loanIndex < loansAffectedCount; loanIndex++)
				{
						//hindi babalik to index 0 to for all, 0 to for payments after the lastInterestDate
						// for ( paymentIndex = 0; paymentIndex < records.Count; paymentIndex++)
						// {
						var breakFlag = false;
						var loan = loansToApply[loanIndex];
						var balanceAdjusted = false;
						
						while (!breakFlag && paymentIndex < records.Count())
						{
								var updatedLoan = loan;
								loan.Payment = await _context.LoanPayments!.Where(e => e.LoanId == loan.Id).ToListAsync();
								var currentPayment = records[paymentIndex];
								var nextDate = loan.NextInterestDate;
								var paymentBalance = currentPayment.Amount - currentPayment.LoanPayments.Sum(e => e.Amount);
								 balanceAdjusted = true;

								while (nextDate < currentPayment.Date)
								{
										var result = _loan.ComputeInterests(updatedLoan!, currentPayment.Date, true).GetAwaiter()
											.GetResult();
										nextDate = result.NextDate;
										updatedLoan = result.NewLoanData;
								}

								var currentPayments = updatedLoan.Payment.Where(e => e.AgainstPrincipal).Sum(e => e.Amount);
								var currentBalance = updatedLoan.Principal - currentPayments;
								var interestPayments = updatedLoan.Payment.Where(e => e.AgainstPrincipal == false).Sum(e => e.Amount);

								updatedLoan.Interests = updatedLoan.InterestRecords.Sum(e => e.Amount)
																				- interestPayments;
								while (paymentBalance > 0 && currentBalance > 0)
								{
										if (updatedLoan.Interests > 0 && paymentBalance > 0)
										{
												if (updatedLoan.Interests < paymentBalance)
												{
														_context.LoanPayments!.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																Amount = updatedLoan.Interests,
																AgainstPrincipal = false,
																UserId = loan.UserId,
																PaymentId = currentPayment.Id,
																AppId = loan.AppId,
																Payment = currentPayment,
																Loan = loan
														});
														paymentBalance -= updatedLoan.Interests;
														updatedLoan.Interests = 0;
												}
												else
												{
														_context.LoanPayments!.Add(new LoanPayment
														{
																Date = currentPayment.Date,
																Amount = paymentBalance,
																AgainstPrincipal = false,
																PaymentId = currentPayment.Id,
																UserId = loan.UserId,
																Payment = currentPayment,
																AppId = loan.AppId,
																Loan = loan
														});
														updatedLoan.Interests -= paymentBalance;
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
														paymentBalance -= currentBalance;
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
																AppId = loan.AppId,
																PaymentId = currentPayment.Id,
																Payment = currentPayment,
																Loan = loan
														});
														currentBalance -= paymentBalance;
														paymentBalance = 0;
												}
										}
								}

								if (currentBalance == 0) updatedLoan.Status = "Closed";

								_context.Loans!.Update(updatedLoan);
								_context.Payments!.Update(currentPayment);

								await _context.SaveChangesAsync();
								var paymentsList = updatedLoan.Payment.Where(e => e.AgainstPrincipal).Sum(e => e.Amount);
								var balance = updatedLoan.Principal - paymentsList;


								if (currentBalance == 0)
								{
										breakFlag = true;
										break;
								}

								paymentIndex++;
						}

						if (loan.Status == "Active" && !balanceAdjusted )
						{
							
							loan.Payment = await _context.LoanPayments!.Where(e => e.LoanId == loan.Id).ToListAsync();
							var currentPayments = loan.Payment.Where(e => e.AgainstPrincipal).Sum(e => e.Amount);
							var currentBalance = loan.Principal - currentPayments;

							if (currentBalance == 0)
							{
								loan.Status = "Closed";
								await _context.SaveChangesAsync();

							}

						} 
						
						
						if (loan.Status != "Closed")
						{
								var nextDatePost = loan.NextComputeDate;

								while (nextDatePost < DateTime.Now.Date)
								{
										var result = _loan.ComputeInterests(loan, DateTime.Now.Date).GetAwaiter()
											.GetResult();
										nextDatePost = result.NextDate;
										loan = result.NewLoanData;
								}

						}

						// }
				}
		}

		public decimal ComputeInterestPercent(LoanProfile loanProfile, DateTime startDate, DateTime date)
		{
				var days = (date - startDate).TotalDays;
				loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
				var sort = loanProfile.Fixed;
				var useIndex = sort.FindIndex(e => e.MaxDays > days);

				if (useIndex > -1) return sort[useIndex].Interest;

				var nextDate = startDate;
				decimal totalInterest = 0;
				while (nextDate < date)
				{
						nextDate = nextDate.AddMonths(1);
						totalInterest += loanProfile.InterestPerMonth;
				}


				if (loanProfile.ComputePerDay && date < nextDate)
				{
						var noOfDaysInMonth = nextDate.AddMonths(1).AddDays(-1).Day;
						var rebateDays = (nextDate - date).Days;
						var percent = rebateDays / noOfDaysInMonth * loanProfile.InterestPerMonth;
						totalInterest -= percent;
				}

				return totalInterest;
		}
}