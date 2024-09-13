using Newtonsoft.Json;

namespace FinanceProject.Models
{
		public class AccountBalance
		{
				public Guid AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }

				public string _month { get; set; } = "";

				public DateTime Month
				{
						get
						{
								return DateTime.Parse(_month);
						}
						set
						{
								_month = value.ToString("yyyy-MM-01");
						}
				}
				public decimal Balance { get; set; }
		}
}
