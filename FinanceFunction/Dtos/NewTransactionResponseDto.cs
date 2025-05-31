using FinanceFunction.Models;

namespace FinanceFunction.Dtos
{
    public class NewTransactionResponseDto
    {
        public Transaction? Transaction { get; set; }

        public List<Account> Accounts { get; set; } = new List<Account>();
        public List<AccountBalance> Balances { get; set; } = new List<AccountBalance>();
				public List<MonthlyTransaction> Monthly { get; set; } = new List<MonthlyTransaction>();

				public List<HookMessage> Notifications { get; set; } = new List<HookMessage>();
           
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
