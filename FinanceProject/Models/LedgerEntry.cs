using System.ComponentModel.DataAnnotations;
using UUIDNext;

namespace FinanceApp.Models;

public class LedgerEntry
{
	[Key]
	public Guid EntryId { get; set; } = Uuid.NewSequential();
	public Guid EntryGroupId { get; set; } = Uuid.NewSequential();

	public DateTime Date { get; set; }
	public DateTime DateAdded { get; set; }
	public Guid AddedBy { get; set; }
	public Guid DebitId { get; set; }
	public Guid CreditId { get; set; }
	public decimal Type { get; set; }
}