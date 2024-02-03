using Newtonsoft.Json;

namespace FinanceProject.Models
{
		public class AccountBalance
		{
				public Guid	AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }


				public DateTime Month { get; set; }
				public decimal Balance { get; set; }
		}
}
