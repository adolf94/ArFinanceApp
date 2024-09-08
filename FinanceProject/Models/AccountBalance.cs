using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceProject.Models
{
		public class AccountBalance
		{
				public Guid AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }

				public string _month { get; set; } = "";

				[NotMapped]
				public DateTime Month
				{
						get
						{
								return DateTime.Parse(_month);
						}
						set
						{
								_month = value.ToString("yyyy-mm-01");
						}
				}
				public decimal Balance { get; set; }
		}
}
