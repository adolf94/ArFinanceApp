using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountBalanceRepo
		{
				public Task CreateAccountBalances(DateTime date);
				public Task<AccountBalance?> CreateAccountBalanceOne(DateTime date, Account acc, bool SaveChanges = true);
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date);
				public IEnumerable<AccountBalance> UpdateDebitAcct(Guid debitId, decimal amount, DateTime date);
				public IQueryable<AccountBalance> GetByDate(DateTime date);
				public IQueryable<AccountBalance> GetByDateCredit(DateTime date);
				public AccountBalance? GetByAccountWithDate(Guid account, DateTime date);
		}
}
