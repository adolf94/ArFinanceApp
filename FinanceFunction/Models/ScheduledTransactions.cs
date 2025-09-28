using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace FinanceFunction.Models
{
		public class ScheduledTransactions
		{
				[Key]
				public Guid Id { get; set; }
				public string CronExpression { get; set; } = string.Empty;
				public string CronId { get; set; } = string.Empty;
				public DateTime DateCreated { get; set; } = DateTime.UtcNow;

				public int TotalOccurence { get; set; }

				public DateTime EndDate { get; set; }

				public DateTime LastTransactionDate { get; set; }
				public int LastTransactionIndex { get; set; }
				public int Iterations { get; set; }
				public DateTime NextTransactionDate { get; set; }
				public bool Enabled { get; set; } = true;


				public Guid? LastTransactionId { get; set; }
				public Transaction? LastTransaction { get; set; }

				public List<string> TransactionIds { get; set; } = new List<string>();
				public string Description { get; set; }

				[JsonIgnore]
				public IEnumerable<Transaction>? Transactions { get; set; }
				
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";

		}
}
