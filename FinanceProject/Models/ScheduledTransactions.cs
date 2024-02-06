using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class ScheduledTransactions
		{
				[Key]
				public Guid Id { get; set; }
				public string CronExpression { get; set; } = string.Empty;
				public string CronId { get; set; } = string.Empty;
						
				public Guid? LastTransactionId { get; set; }
				public Transaction? LastTransaction { get; set; }
				[JsonIgnore]
				public IEnumerable<Transaction>? Transactions { get; set; }
				public DateTime EndDate { get; set; }
				public DateTime DateCreated { get; set; } = DateTime.Now;
				public bool Enabled { get; set; } = true;
		}
}
