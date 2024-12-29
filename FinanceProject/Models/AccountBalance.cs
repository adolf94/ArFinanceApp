using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class AccountBalance
		{
				[Key]
				public string Id
				{
						get
						{
								return $"{Year}/{Month}/{AccountId}";
						}
						set
						{
								return;
						}
				}
				public Guid AccountId { get; set; }
				[JsonIgnore]
				public Account? Account { get; set; }

				public int Year { get; set; }
				public int Month { get; set; }
				//Date Start kasi we can get the end of month by adding Balance + total ng current month.
				// Technically DateStart is DateEnd of last period
				// Note for credit card balance : adjust the view to NEXT month (checked na? NO)
				public DateTime DateStart { get; set; }
				public decimal Balance { get; set; }
				
				public string PartitionKey { get; init; } = "default";
		}
}
