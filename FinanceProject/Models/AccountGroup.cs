using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class AccountGroup
		{
				public Guid Id { get; set; } = new Guid();

				public string? Name { get; set; }
				public bool isCredit { get; set; }
				public bool Enabled { get; set; }
				public Guid AccountTypeId { get; set; }
				public AccountType? AccountType { get; set; } = null;

				public ICollection<Account>? Accounts { get; set; }
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";

		}
}
