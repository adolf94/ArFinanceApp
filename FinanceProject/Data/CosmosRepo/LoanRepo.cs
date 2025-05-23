﻿using FinanceApp.Models;
using FinanceApp.Models.SubModels;
using Microsoft.EntityFrameworkCore;
using UUIDNext;
using static FinanceApp.Models.Loan;

namespace FinanceApp.Data.CosmosRepo
{
	public class LoanRepo : ILoanRepo
	{
		private readonly AppDbContext _context;
		private readonly ILedgerEntryRepo _ledger;

		public LoanRepo(AppDbContext context, ILedgerEntryRepo ledger)
		{
			_context = context;
			_ledger = ledger;
		}

		public async Task<Loan> CreateLoan(Loan loan)
		{

			await _context.Loans!.AddAsync(loan);
			
			
			
			
			
			await _context.SaveChangesAsync();

			return await Task.FromResult(loan);
			//TODO Validate Authenticity of Loan Details
		}

		public async Task<Loan?> GetOneLoan(Guid loanId)
		{

			Loan? item = await _context.Loans!.Where(e => e.Id == loanId).FirstOrDefaultAsync();
			return item;

			//TODO Validate Authenticity of Loan Details
		}

		public async Task<IQueryable<Loan>> GetByUserId(Guid guid, string appId)
		{
			IQueryable<Loan> loans = _context.Loans!.Where(e => e.UserId == guid && e.AppId == appId);
			return await Task.FromResult(loans);
		}


		public async Task<IEnumerable<Loan>> GetPendingInterests()
		{
			DateTime Now = DateTime.Now.Date;
			IQueryable<Loan> loans =  _context.Loans!.Where(e => e.NextComputeDate < Now
			                                                    && e.Status == "Active"
			);


			IEnumerable<Loan> items = await loans.ToArrayAsync();
			return items;
		}

		public async Task<ComputeInterestResult?> ComputeInterests(Loan loan, DateTime dateRef,
			bool createPayment = false)
		{
			if (loan.NextInterestDate > dateRef) return null;
			var balances = new
			{
				Principal = loan.Principal - loan.Payment.Where(e => e.AgainstPrincipal == true).Sum(e => e.Amount),
				Interests = loan.InterestRecords.Sum(e => e.Amount),
				Payments = loan.Payment.Sum(e => e.Amount),
				Balance = loan.Principal + loan.InterestRecords.Sum(e => e.Amount) 
							-loan.Payment.Sum(e => e.Amount)
			};
			DateTime StartDate = loan.Date;
			double days = (loan.NextInterestDate - StartDate).TotalDays;
			decimal totalInterest = 0m;
			// nextDate - When will the next interest start
			// This is used when payments go in
			DateTime nextDate;
			// nextCompute - When the CronJob Will trigger
			// Also used for adding interest for new loans
			DateTime nextCompute;
			DateTime interestEnd = dateRef;
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
				if (useIndex == sort.Count() - 1 && loanProfile.ComputePerDay && !createPayment)
				{
					//Computation for after the interest period (for ComputePer Day)
					nextDate = loan.Date.AddMonths(1);
					while (nextDate.AddMonths(-1) <= loan.Date.AddDays(sort[useIndex].MaxDays))
					{
						nextDate = nextDate.AddMonths(1);
					}
				}

				nextCompute = nextDate;
			}
			else
			{

				nextCompute = loan.Date.AddMonths(1);
				//
				// if (createPayment) 
				// {
					totalInterest = loanProfile.InterestPerMonth;
					while (nextCompute <= loan.NextInterestDate)
					{
						nextCompute = nextCompute.AddMonths(1);
						totalInterest = totalInterest + loanProfile.InterestPerMonth;
					}
					// nextComputeDate = nextDate;

					if (createPayment && loanProfile.ComputePerDay && dateRef < nextCompute)
					{
						int noOfDaysInMonth = DateTime.DaysInMonth(nextCompute!.AddMonths(-1).Year, nextCompute.AddMonths(-1).Month);
						int rebateDays = (nextCompute - dateRef).Days;
						decimal percent = Decimal.Divide(rebateDays , noOfDaysInMonth) * loanProfile.InterestPerMonth;
						totalInterest = totalInterest - percent;
						nextCompute = dateRef;
						// nextComputeDate = nextDate.AddMonths(1);
					}
					nextDate = nextCompute;
			

			}

			decimal interest = 0;
			interestPercent = totalInterest - loan.TotalInterestPercent;
			if (interestPercent < 0) interestPercent = 0;
			decimal interestFactorAmount = 0;
			switch (loanProfile.InterestFactor)
			{
				case "principalBalance":
					interestFactorAmount = balances.Principal;
					interest = balances.Principal * (interestPercent / 100);
					break;
				case "principalTotal":
					interest = loan.Principal * (interestPercent / 100);
					interestFactorAmount = loan.Principal;
					break;
				case "totalBalance":
					interest = balances.Balance * (interestPercent / 100);
					interestFactorAmount = loan.Principal;

					break;
			}

			LoanInterest? newInterestItem = null;
			if (interest > 0)
			{
				Guid entryId = Uuid.NewSequential();
				newInterestItem = new LoanInterest
				{
					DateCreated = DateTime.Now,
					DateStart = loan.InterestRecords.Any()? loan.InterestRecords.Max(e=>e.DateEnd)
						: loan.Date, //double check
					DateEnd = nextDate ,
					Amount = interest,
					TotalPercent = totalInterest,
					LedgerEntryId = entryId
				};
				loan.InterestRecords.Add(newInterestItem);
				loan.Interests = loan.Interests + newInterestItem.Amount;
				loan.TotalInterestPercent = totalInterest;
				Guid? debitId = await _context.Users!.Where(e=>e.Id == loan.UserId).Select(e => e.AcctReceivableId).FirstAsync();
				LedgerEntry entry = new LedgerEntry
				{
					AddedBy = loan.UserId,
					Date = loan.NextInterestDate.Date,
					Amount = interest,
					DebitId = debitId!.Value,
					CreditId = _context.InterestIncomeId,
					DateAdded = DateTime.Now,
					MonthGroup = loan.NextInterestDate.ToString("yyyy-MM"),
					Description = $"Added Interest at {interestPercent}% of {interestFactorAmount} ({loanProfile.InterestFactor})",
					EntryId = entryId,
					RelatedEntries = [new LedgerEntryTransaction{TransactionId = loan.Id, Type = EntryTransactionTypes.Loan}],
					EntryGroupId = entryId					
				};
				await _ledger.CreateAsync(entry,false);
			}


			loan.NextComputeDate = nextCompute;
			loan.LastInterestDate = loan.NextInterestDate.Date;
			loan.NextInterestDate = nextDate.Date;

			_context.Update(loan);
			await _context.SaveChangesAsync();
			//loan.InterestRecords = loan.InterestRecords.Append(newInterestItem);
			return new ComputeInterestResult
			{
				NewLoanData = loan,
				InterestData = newInterestItem,
				NextDate = createPayment? nextDate : nextCompute 
			};
		}

		public Guid InterestIncomeId()
		{
			return _context.InterestIncomeId;
		}

			public async Task<IQueryable<Loan>> GetLoansByMemberId(Guid guid, string appId)
			{
				IQueryable<Loan> loans = _context.Loans!.Where(e => e.CoborrowerId == guid && e.AppId == appId);
				return await Task.FromResult(loans);
			}

			public async Task<decimal> GetOutstandingBalance(Guid UserId, string appId)
			{
				IEnumerable<Loan> loans = await _context.Loans!
					.Where(e => e.UserId == UserId && e.Status == "Active" && e.AppId == appId).ToArrayAsync();

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
				public Loan? NewLoanData { get; set; }
				public LoanInterest? InterestData { get; set; }
				public DateTime NextDate { get; set; }
		}

}