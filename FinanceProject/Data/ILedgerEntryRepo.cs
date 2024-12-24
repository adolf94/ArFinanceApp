using FinanceApp.Models;

namespace FinanceApp.Data
{
	public interface ILedgerEntryRepo
	{
		public Task<LedgerEntry> CreateAsync(LedgerEntry entry, bool saveChanges);
		public  Task<bool> ReverseEntry(Guid id, bool saveChanges);
		public Task<IEnumerable<LedgerEntry>> GetAllAsync();
		public  Task<IEnumerable<LedgerEntry>> GetByMonth(string month);
		public  Task<LedgerEntry?> GetOne(Guid entryId);


	}
}
