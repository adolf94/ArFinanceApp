using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;
using static FinanceApp.Models.Loans;

namespace FinanceApp.Data.CosmosRepo
{
		public class LoanRepo : ILoanRepo
		{
				private readonly AppDbContext _context;

				public LoanRepo(AppDbContext context)
				{
						_context = context;
				}

				public async Task<Loans> CreateLoan(Loans loan)
				{

						await _context.Loans!.AddAsync(loan);
						await _context.SaveChangesAsync();

						return await Task.FromResult(loan);
						//TODO Validate Authenticity of Loan Details
				}
				public async Task<Loans?> GetOneLoan(Guid loanId)
				{

						Loans? item = await _context.Loans!.Where(e => e.Id == loanId).FirstOrDefaultAsync();
						return item;

						//TODO Validate Authenticity of Loan Details
				}

				public async Task<IQueryable<Loans>> GetByUserId(Guid guid)
				{
						IQueryable<Loans> loans = _context.Loans!.Where(e => e.UserId == guid);
						return await Task.FromResult(loans);
				}


				public async Task<IEnumerable<Loans>> GetPendingInterests()
				{
						DateTime Now = DateTime.Now.Date;
						IQueryable<Loans> loans = _context.Loans!.Where(e => e.NextInterestDate < Now
								&& e.Status == "Active"
						);


						IEnumerable<Loans> items = await loans.ToArrayAsync();
						return items;
				}

				public async Task<ComputeInterestResult?> ComputeInterests(Loans loan, DateTime dateRef, bool createPayment = false)
				{
						if (loan.NextInterestDate > dateRef) return null;
						var balances = new
						{
								Principal = loan.Principal - loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount),
								Interests = loan.InterestRecords.Sum(e => e.Amount),
								Payments = loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount),
								Balance = loan.Principal + loan.Interests - loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount)
						};
						DateTime StartDate = loan.Date;
						double days = (loan.NextInterestDate - StartDate).TotalDays;
						decimal totalInterest = 0m;
						DateTime nextDate;
						DateTime nextComputeDate;
						LoanProfile loanProfile = loan.LoanProfile;
						loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
						var sort = loanProfile.Fixed;
						int useIndex = sort.FindIndex(e => e.MaxDays > days);
						decimal interestPercent = 0m;

						if (useIndex > -1)
						{
								if (useIndex == 0)
								{
										interestPercent = sort[useIndex].Interest;

								}
								else
								{
										interestPercent = sort[useIndex].Interest - sort[useIndex - 1].Interest;


								}
								nextDate = loan.Date.AddDays(sort[useIndex].MaxDays);
								totalInterest = sort[useIndex].Interest;
								nextComputeDate = nextDate;
								if (useIndex == sort.Count() - 1 && loanProfile.ComputePerDay && !createPayment)
								{
										//Computation for after the interest period (for ComputePer Day)
										nextComputeDate = loan.Date.AddMonths(1);
										while (nextDate.AddMonths(-1) <= loan.Date.AddDays(sort[useIndex].MaxDays))
										{
												nextComputeDate = nextComputeDate.AddMonths(1);
										}
								}
						}
						else
						{
								nextDate = loan.Date.AddMonths(1);

								nextComputeDate = nextDate;
								if (createPayment || !loanProfile.ComputePerDay)
								{
										totalInterest = loanProfile.InterestPerMonth;
										while (nextDate <= loan.NextInterestDate && loan.LastInterestDate < dateRef)
										{
												nextDate = nextDate.AddMonths(1);
												totalInterest = totalInterest + loanProfile.InterestPerMonth;

										}
										nextComputeDate = nextDate;

										if (loanProfile.ComputePerDay && dateRef < nextDate)
										{

												int noOfDaysInMonth = nextDate.AddMonths(1).AddDays(-1).Day;
												int rebateDays = (nextDate - dateRef).Days;
												decimal percent = (rebateDays / noOfDaysInMonth) * loanProfile.InterestPerMonth;
												totalInterest = totalInterest - percent;
												nextDate = dateRef;
												nextComputeDate = nextDate.AddMonths(1);
										}
								}
								else
								{
										totalInterest = 0;
										while (nextComputeDate <= loan.NextInterestDate)
										{
												nextComputeDate = nextComputeDate.AddMonths(1);
												totalInterest = totalInterest + loanProfile.InterestPerMonth;
										}
										nextDate = nextComputeDate.AddMonths(-1);
								}



						}
						decimal interest = 0;
						interestPercent = totalInterest - loan.TotalInterestPercent;
						switch (loanProfile.InterestFactor)
						{
								case "principalBalance":
										interest = balances.Principal * (interestPercent / 100);

										break;
								case "principalTotal":
										interest = loan.Principal * (interestPercent / 100);

										break;
								case "totalBalance":
										interest = balances.Balance * (interestPercent / 100);

										break;
						}

						var newInterestItem = new LoanInterest
						{
								DateCreated = DateTime.Now,
								DateStart = loan.NextInterestDate.Date,
								DateEnd = nextDate.Date,
								Amount = interest,
								TotalPercent = totalInterest,
						};


						loan.InterestRecords.Add(newInterestItem);
						loan.Interests = loan.Interests + newInterestItem.Amount;
						loan.TotalInterestPercent = totalInterest;
						loan.LastInterestDate = loan.NextInterestDate.Date;
						loan.NextInterestDate = nextComputeDate;

						_context.Update(loan);
						await _context.SaveChangesAsync();
						//loan.InterestRecords = loan.InterestRecords.Append(newInterestItem);
						return new ComputeInterestResult
						{
								NewLoanData = loan,
								InterestData = newInterestItem,
								NextDate = createPayment ? nextDate : nextComputeDate.Date
						};
				}

				public async Task<decimal> GetOutstandingBalance(Guid UserId)
				{
						IEnumerable<Loans> loans = await _context.Loans!.Where(e => e.UserId == UserId && e.Status == "Active").ToArrayAsync();

						decimal result = loans.Select(loan =>
						{
								decimal interests = loan.InterestRecords.Select(e => e.Amount).Sum();
								decimal payments = loan.Payment.Select(e => e.Amount).Sum();

								return loan.Principal + interests - payments;

						})
						.Sum();
						return result;
				}

		}

		public class ComputeInterestResult
		{
				public Loans NewLoanData { get; set; }
				public LoanInterest InterestData { get; set; }
				public DateTime NextDate { get; set; }
		}

}