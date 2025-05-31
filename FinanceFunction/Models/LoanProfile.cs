using System.ComponentModel.DataAnnotations;
using FinanceFunction.Models.SubModels;

namespace FinanceFunction.Models
{
		public class LoanProfile
		{
				public Guid ProfileId { get; set; } = Guid.NewGuid();
				public string AppId { get; set; } = string.Empty;
				public string LoanProfileName { get; set; } = string.Empty;
				public decimal InterestPerMonth { get; set; }
				public bool ComputePerDay { get; set; }
				public string InterestFactor { get; set; } = "principalBalance";

				//public List<FixedInterests> Fixed { get; set; } = new List<FixedInterests>();
				


		}
}
