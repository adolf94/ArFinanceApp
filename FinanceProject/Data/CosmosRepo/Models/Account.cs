using System.Text.Json.Serialization;

namespace FinanceProject.Data.CosmosRepo.Models
{
		public class Account : FinanceProject.Models.Account
		{


				[JsonIgnore]
				public new ICollection<Transaction>? TransactionsAsDebit { get; set; }
				[JsonIgnore]
				public new ICollection<Transaction>? TransactionsAsCredit { get; set; }
		}
}
