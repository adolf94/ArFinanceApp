using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo;

public class LedgerAcctRepo : ILedgerAcctRepo
{
	private readonly AppDbContext _context;

	public LedgerAcctRepo(AppDbContext context)
	{
			_context = context;
	}


	public async Task<LedgerAccount> CreateLedgerAccount(LedgerAccount account)
	{
		_context.LedgerAccounts!.Add(account);
		await _context.SaveChangesAsync();
		return account;
	}

	public async Task<LedgerAccount?> GetOne(Guid id)
	{
		return await _context.LedgerAccounts!.Where(e=>e.LedgerAcctId==id).FirstOrDefaultAsync();
	}

	public async Task<IEnumerable<LedgerAccount>> GetAllLedgerAccounts()
	{
		return await _context.LedgerAccounts!.ToListAsync()!;
	}
	
}