using Newtonsoft.Json;

namespace FinanceProject.Models
{
		public class User
		{
				public Guid Id { get; set; } = new Guid();

				public string? UserName { get; set; }
				public int AzureId { get; set; }

				[JsonIgnore]
				public ICollection<Transaction>? Transactions { get; set; }
		}
}
