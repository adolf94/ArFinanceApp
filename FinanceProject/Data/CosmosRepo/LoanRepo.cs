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

				public async Task<ComputeInterestResult> ComputeInterests(Loans loan)
				{

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
						}
						else
						{
								nextDate = loan.Date.AddMonths(1);

								totalInterest = loanProfile.InterestPerMonth;
								while (nextDate <= loan.NextInterestDate)
								{
										nextDate = nextDate.AddMonths(1);
										totalInterest = totalInterest + loanProfile.InterestPerMonth;

								}

								if (loanProfile.ComputePerDay)
								{
										//const curDaysInMonth = nextDate.daysInMonth()
										//const noOfDaysInMonth = nextDate.daysInMonth();

										//const rebateDays = nextDate.diff(balance.date, 'day');
										//const percent = (rebateDays / noOfDaysInMonth) * loanProfile.interestPerMonth!

										//totalInterest = totalInterest - percent

										//lastInterest = balance.date.clone()

										//nextDate = balance.date.clone().add(1, 'day')

								}


								interestPercent = totalInterest - loan.TotalInterestPercent;

								if (interestPercent <= 0) interestPercent = 0;


						}
						decimal interest = 0;
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
								Amount = interest
						};


						loan.InterestRecords.Add(newInterestItem);
						loan.Interests = loan.Interests + newInterestItem.Amount;
						loan.TotalInterestPercent = interestPercent;
						loan.LastInterestDate = loan.NextInterestDate.Date;
						loan.NextInterestDate = nextDate.Date;

						_context.Update(loan);
						await _context.SaveChangesAsync();
						//loan.InterestRecords = loan.InterestRecords.Append(newInterestItem);
						return new ComputeInterestResult
						{
								NewLoanData = loan,
								InterestData = newInterestItem,
								NextDate = nextDate.Date
						};
				}


		}

		public class ComputeInterestResult
		{
				public Loans NewLoanData { get; set; }
				public LoanInterest InterestData { get; set; }
				public DateTime NextDate { get; set; }
		}

}