using FinanceFunction.Models;

namespace FinanceFunction.Data
{
		public interface IAccountTypeRepo
		{
				public Task<ICollection<AccountType>> GetAllType();
				public AccountType? GetOne(Guid id);
				public Task<bool> Create(AccountType accountType);
		}
}
