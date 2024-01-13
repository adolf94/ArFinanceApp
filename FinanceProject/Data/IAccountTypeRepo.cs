using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IAccountTypeRepo
		{
				public ICollection<AccountType> GetAllType();
				public AccountType? GetOne(Guid id);
				public bool Create(AccountType accountType);
		}
}
