using System.ComponentModel.DataAnnotations;

namespace FinanceFunction.Models
{
		public class Currency
		{
				[Key]
				public int currencyId { get; set; }
				public string CurrencyName { get; set; } = string.Empty;
				public string CurrencyCode { get; set; } = string.Empty;
		}
}
