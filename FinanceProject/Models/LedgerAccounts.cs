using System.ComponentModel.DataAnnotations;
using Microsoft.Azure.Cosmos;

namespace FinanceApp.Models;

public class LedgerAccount
{
	[Key]
	public Guid LedgerAcctId { get; set; } = Guid.NewGuid();
	public DateTime DateAdded { get; set; } = DateTime.Now;
	public Guid AddedBy  { get; set; }
	public string Name { get; set; }
	public string Section { get; set; }
	public decimal Balance { get; set; } = 0;
	public string PartitionKey { get; } = "default";

}