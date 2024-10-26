using FinanceApp.Data.CosmosRepo;
using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface ILoanRepo
		{
				public Task<Loan> CreateLoan(Loan loan);
				public Task<IQueryable<Loan>> GetByUserId(Guid guid);
				public Task<Loan?> GetOneLoan(Guid loanId);
				public Task<ComputeInterestResult> ComputeInterests(Loan loan, DateTime dateRef, bool createPayment = false);
				public Task<IEnumerable<Loan>> GetPendingInterests();
				public Task<decimal> GetOutstandingBalance(Guid UserId);


		}
}
