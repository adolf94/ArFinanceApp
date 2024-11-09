using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface ILoanProfileRepo
		{
				public Task<LoanProfile> CreateNewProfile(LoanProfile profile);
				public Task<LoanProfile?> GetOneProfile(string appId, Guid id);
				public Task<IEnumerable<LoanProfile>> GetAll(string appId);

		}
}
