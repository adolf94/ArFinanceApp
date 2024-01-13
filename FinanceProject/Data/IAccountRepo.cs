using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountRepo
		{
				public ICollection<Account> GetAccounts();
				public bool Create(Account group);
				public Account? GetOne(Guid id);

		}
}
