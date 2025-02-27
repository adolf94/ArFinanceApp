using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountBalanceRepo
		{
			public  Task<IEnumerable<AccountBalance>> UpdateCrAccount(Guid creditId, decimal amount,
				Guid transaction, DateTime date, bool reverse = false, bool save = true);
			public  Task<IEnumerable<AccountBalance>> UpdateDrAccount(Guid debitId, decimal amount,
				Guid transaction, DateTime date, bool reverse = false, bool save = true);
				public Task<AccountBalance> CreateBalances(Account acct, DateTime month, bool save = true);

				public Task<AccountBalance?> GetOne(Account acct, DateTime date);

				

				public IQueryable<AccountBalance> GetByDate(DateTime date);
				public IQueryable<AccountBalance> GetByDateCredit(DateTime date);
				public AccountBalance? GetByAccountWithDate(Guid account, DateTime date);
		}
}
