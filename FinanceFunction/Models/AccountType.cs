using System.ComponentModel.DataAnnotations;

namespace FinanceFunction.Models
{
		public class AccountType
		{
				public Guid Id { get; set; } = new Guid();

				public string? Name { get; set; }
				public bool Enabled { get; set; }
				public bool ShouldResetPeriodically { get; set; }
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";

		}
}
