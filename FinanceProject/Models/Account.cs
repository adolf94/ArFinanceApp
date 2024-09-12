namespace FinanceProject.Models
{
		public class Account
		{
				public Guid Id { get; set; } = Guid.NewGuid();
				public string? Name { get; set; }
				public bool Enabled { get; set; }
				public Guid? AccountGroupId { get; set; }
				public AccountGroup? AccountGroup { get; set; }
				public decimal ForeignExchange { get; set; }
				public decimal Balance { get; set; }
				public decimal CurrBalance { get; set; }
				public int PeriodStartDay { get; set; } = 1;
				public bool ResetEndOfPeriod { get; set; } = false;


				//[JsonIgnore]
				//public ICollection<Transaction>? TransactionsAsDebit { get; set; }
				//[JsonIgnore]
				//public ICollection<Transaction>? TransactionsAsCredit { get; set; }
		}
}
