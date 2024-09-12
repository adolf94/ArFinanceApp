namespace FinanceProject.Data.CosmosRepo.Models
{
		public class Account : FinanceProject.Models.Account
		{

				public new Guid Id { get; set; } = Guid.NewGuid();

				//[JsonIgnore]
				//public new ICollection<Transaction>? TransactionsAsDebit { get; set; }
				//[JsonIgnore]
				//public new ICollection<Transaction>? TransactionsAsCredit { get; set; }
		}
}
