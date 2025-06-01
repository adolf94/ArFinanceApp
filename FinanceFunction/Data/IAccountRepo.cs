using FinanceFunction.Models;

namespace FinanceFunction.Data
{
		public interface IAccountRepo
		{
				public ICollection<Account> GetAccounts(bool All);
				public Account UpdateDebitAcct(Guid debitId, decimal amount);
				public Account UpdateCreditAcct(Guid creditId, decimal amount);
				public Task<Account?> GetAccountFromName(Guid groupId, string name);
				public bool Create(Account group);
				public Account? GetOne(Guid id);

		} 
}
