using FinanceApp.Utilities;
using Newtonsoft.Json;

namespace FinanceProject.Data.CosmosRepo.Models
{
		public class AccountBalance
		{
				public Guid AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }

				public long Month { get; set; } = 0;
				public string StrMonth
				{
						get
						{
								return DateTime.UnixEpoch.AddSeconds(Month).ToDateOnlyString();
						}
						set
						{
								Month = DateTime.Parse(value).ToEpoch();
						}
				}
				public decimal Balance { get; set; }
		}
}
