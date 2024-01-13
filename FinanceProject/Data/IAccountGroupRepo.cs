using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountGroupRepo
		{
				public ICollection<AccountGroup> GetAccounts();
				public bool Create(AccountGroup group);
				public AccountGroup? GetOne(Guid id);
				public ICollection<AccountGroup> GetByType(Guid id);

		}
}
