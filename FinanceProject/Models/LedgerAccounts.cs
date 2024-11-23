using System.ComponentModel.DataAnnotations;
using Microsoft.Azure.Cosmos;

namespace FinanceApp.Models;

public class LedgerAccounts
{
	[Key]
	public Guid LedgerAcctId { get; set; }
	public DateTime DateAdded { get; set; } = DateTime.Now;
	public Guid AddedBy  { get; set; }
	public string Name { get; set; }
	public string Section { get; set; }
	public decimal Balance { get; set; }
}