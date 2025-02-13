using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class AccountBalance
		{
			public AccountBalance()
			{
				
			}

			public AccountBalance(int year, int month, Guid acctId)
			{
				Year = year;
				Month = month;
				AccountId = acctId;
				Id = $"{Year}|{Month:D2}|{AccountId}";
				DateStart = new DateTime(year, month, 1);
				DateEnd = new DateTime(year, month, 1).AddMonths(1);
				PartitionKey = "default";
			}
			
			public AccountBalance(int year, int month, Guid acctId, int startDate)
			{
				Year = year;
				Month = month;
				AccountId = acctId;
				Id = $"{Year}|{Month:D2}|{AccountId}";
				DateStart = new DateTime(year, month, startDate);
				DateEnd = new DateTime(year, month, startDate).AddMonths(1);
				PartitionKey = "default";
			}

			[Key] public string Id { get; set; } = "";

				public Guid AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }

				public int Year { get; set; }
				public int Month { get; set; }
				//Date Start kasi we can get the end of month by adding Balance + total ng current month.
				// Technically DateStart is DateEnd of last period
				// Note for credit card balance : adjust the view to NEXT month (checked na? NO)
				public DateTime DateStart { get; set; }
				public DateTime DateEnd { get; set; }


				public decimal EndingBalance { get; set; } = 0;
				public decimal Balance { get; set; } = 0;
				
				public string PartitionKey { get; init; } = "default";
				
				
				public List<BalanceTransactions> Transactions { get; set; } = new ();
				
				
				
		}

		public class BalanceTransactions
		{
			public Guid TransactionId { get; set; }
			public decimal Amount { get; set; }
		}
}
