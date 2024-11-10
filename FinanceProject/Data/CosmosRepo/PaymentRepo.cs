using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo;

public class PaymentRepo : IPaymentRepo
{
	private readonly AppDbContext _context;
	private readonly ILoanRepo _loan;

	public PaymentRepo(AppDbContext context, ILoanRepo loan)
	{
		_context = context;
		_loan = loan;
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
		await _context.SaveChangesAsync();


		//get and update affected loans (for interest recalculation)
		var affectedLoans = await _context.Loans!.Where(e =>
				e.AppId == record.AppId && e.UserId == record.UserId && e.LastInterestDate > record.Date)
			.ToListAsync();
		//rollback Interest charging
		affectedLoans.ForEach(loan =>
		{
			var lastToRetain = loan.InterestRecords.Where(e => e.DateEnd <= record.Date)
				.OrderByDescending(e => e.DateStart)
				.FirstOrDefault();
			if (lastToRetain == null)
			{
				loan.LastInterestDate = loan.Date;
				loan.NextInterestDate = loan.Date;
				loan.NextComputeDate = loan.Date;
			}
			else
			{
				var loanProfile = loan.LoanProfile;
				loan.TotalInterestPercent = lastToRetain.TotalPercent;
				//ComputeInterestPercent(loanProfile, loan.Date, lastToRetain.DateEnd);
				// if (loanProfile.ComputePerDay)
				// {
				// 	var days = (loan.Date - lastToRetain.DateEnd).TotalDays;
				// 	loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
				// 	var sort = loanProfile.Fixed;
				// 	var useIndex = sort.FindIndex(e => e.MaxDays > days);
				// 	loan.LastInterestDate = lastToRetain.DateEnd;
				// 	loan.NextInterestDate = useIndex > -1
				// 		? loan.Date.AddDays(sort[useIndex].MaxDays)
				// 		: lastToRetain.DateEnd.AddMonths(1);
				// }
				// else
				// {
					// var days = (loan.Date - lastToRetain.DateEnd).TotalDays;
					// loanProfile.Fixed.Sort((a, b) => a.MaxDays - b.MaxDays);
					// var sort = loanProfile.Fixed;
					// var useIndex = sort.FindIndex(e => e.MaxDays > days);
					
					loan.LastInterestDate = lastToRetain.DateStart;
					loan.NextInterestDate = lastToRetain.DateEnd;
					loan.NextComputeDate = loanProfile.ComputePerDay
						? lastToRetain.DateEnd.AddMonths(1)
						: lastToRetain.DateEnd;
				// }
			}

			var interestToRemove = loan.InterestRecords.Where(e => e.DateEnd > record.Date).ToList();

			loan.Status = "Active";

			interestToRemove.ForEach(e => { loan.InterestRecords.Remove(e); });
		});
		await _context.SaveChangesAsync();

		var loansToApply = await _context.Loans!.Where(e => e.AppId == record.AppId && e.UserId == record.UserId)
			.ToListAsync();

		loansToApply = loansToApply
			.OrderByDescending(e => e.LoanProfile.InterestPerMonth)
			.ThenBy(e => e.Date).ToList();

		//int paymentIndex = 0;
		//PaymentRecord currentPayment = records[paymentIndex];
		//decimal paymentBalance = currentPayment.Amount;

		for (var loanIndex = 0; loanIndex < loansToApply.Count(); loanIndex++)
		{
			var loan = loansToApply[loanIndex];

			var appliedPayments = await _context.LoanPayments!.Where(e => e.AppId == record.AppId
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

		for (var loanIndex = 0; loanIndex < loansToApply.Count(); loanIndex++)
		{
			//hindi babalik to index 0 to for all, 0 to for payments after the lastInterestDate
			// for ( paymentIndex = 0; paymentIndex < records.Count; paymentIndex++)
			// {
			var breakFlag = false;
			Loan loan =  loansToApply[loanIndex];
			while (!breakFlag && paymentIndex < records.Count())
			{
				var updatedLoan = loan;

				var currentPayment = records[paymentIndex];
				var nextDate = loan.NextInterestDate;
				var paymentBalance = currentPayment.Amount - currentPayment.LoanPayments.Sum(e => e.Amount);

				while (nextDate < currentPayment.Date)
				{
					var result = _loan.ComputeInterests(updatedLoan, currentPayment.Date, true).GetAwaiter()
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
							_context.LoanPayments.Add(new LoanPayment
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
								UserId = loan.UserId,
								Payment = currentPayment,
								AppId = loan.AppId,
								Loan = loan
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
								AppId = loan.AppId,
								PaymentId = currentPayment.Id,
								Payment = currentPayment,
								Loan = loan
							});
							currentBalance = currentBalance - paymentBalance;
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
				loan = updatedLoan;

				if (currentBalance == 0)
				{
					breakFlag = true;
					break;
				}

				paymentIndex++;
			}
			if (  loan.Status != "Closed")
			{
				var nextDatePost = loan.NextComputeDate;
					
				while (nextDatePost < DateTime.Now.Date)
				{
					var result = _loan.ComputeInterests(loan, DateTime.Now.Date).GetAwaiter()
						.GetResult();
					nextDatePost = result.NextDate;
					loan = result.NewLoanData;
				}
				_context.Loans!.Update(loan);
				await _context.SaveChangesAsync();

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
			totalInterest = totalInterest + loanProfile.InterestPerMonth;
		}


		if (loanProfile.ComputePerDay && date < nextDate)
		{
			var noOfDaysInMonth = nextDate.AddMonths(1).AddDays(-1).Day;
			var rebateDays = (nextDate - date).Days;
			var percent = rebateDays / noOfDaysInMonth * loanProfile.InterestPerMonth;
			totalInterest = totalInterest - percent;
		}

		return totalInterest;
	}
}