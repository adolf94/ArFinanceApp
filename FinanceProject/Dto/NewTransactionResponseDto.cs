using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class NewTransactionResponseDto
		{
				public Transaction? Transaction { get; set; }
				
				public List<Account> Accounts { get; set; } = new List<Account>();
				public List<AccountBalance> Balances { get; set; } = new List<AccountBalance>();
		}
}
