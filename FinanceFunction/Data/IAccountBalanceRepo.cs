using FinanceFunction.Models;

namespace FinanceFunction.Data
{
		public interface IAccountBalanceRepo
		{


        public Task<IEnumerable<AccountBalance>> UpdateCrAccount(Transaction transaction, bool reverse = false, bool save = true);
        public  Task<IEnumerable<AccountBalance>> UpdateDrAccount(Transaction transaction, bool reverse = false, bool save = true);
				public Task<AccountBalance> CreateBalances(Account acct, DateTime month, bool save = true);

				public Task<AccountBalance?> GetOne(Account acct, DateTime date);

				public Task<IQueryable<AccountBalance>> GetAll();
				

				public IQueryable<AccountBalance> GetByDate(DateTime date);
				public IQueryable<AccountBalance> GetByDateCredit(DateTime date);
				public AccountBalance? GetByAccountWithDate(Guid account, DateTime date);
		}
}
