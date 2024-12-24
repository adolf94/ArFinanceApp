using FinanceApp.Models;

namespace FinanceApp.Data;

public interface ILedgerAcctRepo
{
	public Task<LedgerAccount> CreateLedgerAccount(LedgerAccount account);
	public  Task<IEnumerable<LedgerAccount>> GetAllLedgerAccounts();
	public  Task<LedgerAccount?> GetOne(Guid id);

}