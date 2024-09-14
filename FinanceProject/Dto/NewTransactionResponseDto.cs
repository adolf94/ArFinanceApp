using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class NewTransactionResponseDto
		{
				public Transaction? Transaction { get; set; }

				public List<Account> Accounts { get; set; } = new List<Account>();
				public List<AccountBalance> Balances { get; set; } = new List<AccountBalance>();


				public class AccountBalanceKey
				{
						public AccountBalanceKey(Guid accountId, int year, int month)
						{
								AccountId = accountId;
								Month = month;
								Year = year;
						}
						public Guid AccountId { get; set; }
						public int Month { get; set; }
						public int Year { get; set; }
				}
		}
}
