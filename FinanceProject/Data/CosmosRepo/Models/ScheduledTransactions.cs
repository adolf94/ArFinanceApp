using FinanceApp.Utilities;
using Newtonsoft.Json;


namespace FinanceProject.Data.CosmosRepo.Models
{
		public class ScheduledTransactions : FinanceProject.Models.ScheduledTransactions
		{
				public new long DateCreated { get; set; }


				public new long EndDate { get; set; }
				public string StrEndDate
				{

						get
						{
								return DateTime.UnixEpoch.AddSeconds(EndDate).ToDateOnlyString();
						}
						set
						{
								EndDate = DateTime.Parse(value).ToEpoch();
						}
				}

				public new long LastTransactionDate { get; set; }
				public string StrLastDate
				{

						get
						{
								return DateTime.UnixEpoch.AddSeconds(LastTransactionDate).ToDateOnlyString();
						}
						set
						{
								LastTransactionDate = DateTime.Parse(value).ToEpoch();
						}
				}

				public new long NextTransactionDate { get; set; }
				public string StrNextDate
				{

						get
						{
								return DateTime.UnixEpoch.AddSeconds(NextTransactionDate).ToDateOnlyString();
						}
						set
						{
								NextTransactionDate = DateTime.Parse(value).ToEpoch();
						}
				}


				public new Transaction? LastTransaction { get; set; }
				[JsonIgnore]
				public new IEnumerable<Transaction>? Transactions { get; set; }
		}
}
