using System.ComponentModel.DataAnnotations;
using FinanceFunction.Models.SubModels;
using UUIDNext;

namespace FinanceFunction.Models;

public class LedgerEntry
{
	
	private string _monthGroup;
	
	[Key]
	public Guid EntryId { get; set; } = Uuid.NewSequential();
	public Guid EntryGroupId { get; set; } = Uuid.NewSequential();

	[MaxLength(10)]
	public string MonthGroup { get => Date.ToString("yyyy-MM"); set => _monthGroup = Date.ToString("yyyy-MM"); }

	public DateTime Date { get; set; }
	public DateTime DateAdded { get; set; } = DateTime.Now;
	public Guid AddedBy { get; set; }
	public Guid DebitId { get; set; }
	public Guid CreditId { get; set; }

	public List<LedgerEntryTransaction> RelatedEntries { get; set; } = new List<LedgerEntryTransaction>();
	
	[MaxLength(250)]
	public string Description { get; set; } = string.Empty;
	public decimal Amount { get; set; } = 0;

}