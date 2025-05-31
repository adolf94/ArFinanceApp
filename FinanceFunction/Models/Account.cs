
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinanceFunction.Models
{
		public class Account
		{
				public Guid Id { get; set; } = Guid.CreateVersion7();
				public string? Name { get; set; }
				public bool Enabled { get; set; } = true;
				public Guid? AccountGroupId { get; set; }
				public AccountGroup? AccountGroup { get; set; }
				public decimal ForeignExchange { get; set; }
				public decimal Balance { get; set; }
				public decimal CurrBalance { get; set; }
				public int PeriodStartDay { get; set; } = 1;
				public bool ResetEndOfPeriod { get; set; } = false;
				
				
				public DateTime MinMonth { get; set; }
				public DateTime MaxMonth { get; set; } 

				[JsonIgnore]
				public ICollection<Transaction>? TransactionsAsDebit { get; set; }
				[JsonIgnore]
				public ICollection<Transaction>? TransactionsAsCredit { get; set; }


				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";
		}
}
