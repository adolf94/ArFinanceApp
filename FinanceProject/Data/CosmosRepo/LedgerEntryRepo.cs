using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo;

public class LedgerEntryRepo : ILedgerEntryRepo
{
	private readonly AppDbContext _context;

	public LedgerEntryRepo(AppDbContext context)
	{
		_context = context;
	}

	public async Task<LedgerEntry> CreateAsync(LedgerEntry entry, bool saveChanges = true)
	{
		_context.LedgerEntries!.Add(entry);
		
		//Update the accounts
		
		LedgerAccount credit = await _context.LedgerAccounts!.Where(e=>e.LedgerAcctId == entry.CreditId).FirstAsync();
		credit!.Balance = credit.Balance - entry.Amount;
		
		LedgerAccount debit = await _context.LedgerAccounts!.Where(e => e.LedgerAcctId == entry.DebitId).FirstAsync();
		debit!.Balance = debit.Balance + entry.Amount;
		
		
		if(saveChanges ) await _context.SaveChangesAsync();
		return entry;
	}

	public async Task<IEnumerable<LedgerEntry>> GetAllAsync()
	{
		return await _context.LedgerEntries!.ToListAsync();
	}
	
	public async Task<bool> ReverseEntry(Guid id, bool saveChanges = true)
	{
		LedgerEntry? entry = await _context.LedgerEntries!.Where(e=>e.EntryId == id).FirstOrDefaultAsync();

		if(entry == null) return false;
		//Update the accounts
		
		LedgerAccount credit = await _context.LedgerAccounts!.Where(e=>e.LedgerAcctId == entry.CreditId).FirstAsync();
		credit!.Balance = credit.Balance - entry.Amount;
		
		LedgerAccount debit = await _context.LedgerAccounts!.Where(e => e.LedgerAcctId == entry.DebitId).FirstAsync();
		debit!.Balance = debit.Balance + entry.Amount;

		_context.LedgerEntries!.Remove(entry);
		
		if(saveChanges ) await _context.SaveChangesAsync();
		return true;
	}

	public async Task<IEnumerable<LedgerEntry>> GetByMonth(string month)
	{
		var items = await _context.LedgerEntries!.Where(e=>e.MonthGroup == month).ToArrayAsync();
		return items;
	}

	public async Task<LedgerEntry?> GetOne(Guid entryId)
	{
		var item = await _context.LedgerEntries!.Where(e => e.EntryId == entryId).FirstOrDefaultAsync();
		return item;
	}

}