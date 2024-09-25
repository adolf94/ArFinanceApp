using FinanceProject.Models;
using System.Text.Json.Serialization;

namespace FinanceApp.Data.CosmosRepo.Dtos
{
		public class User
		{
				public Guid Id { get; set; } = new Guid();

				public string? UserName { get; set; }
				public string? AzureId { get; set; }

				public string MobileNumber { get; set; } = string.Empty;

				public string EmailAddress { get; set; } = string.Empty;


				[JsonIgnore]
				public ICollection<Transaction>? Transactions { get; set; }
		}
}
