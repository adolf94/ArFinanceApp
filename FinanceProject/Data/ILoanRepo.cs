using FinanceApp.Data.CosmosRepo;
using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface ILoanRepo
		{
				public Task<Loans> CreateLoan(Loans loan);
				public Task<IQueryable<Loans>> GetByUserId(Guid guid);
				public Task<Loans?> GetOneLoan(Guid loanId);
				public Task<ComputeInterestResult> ComputeInterests(Loans loan, DateTime dateRef, bool createPayment = false);

		}
}
