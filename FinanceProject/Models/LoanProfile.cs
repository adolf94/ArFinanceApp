using FinanceApp.Models.SubModels;

namespace FinanceApp.Models
{
		public class LoanProfile
		{
				public Guid ProfileId { get; set; } = Guid.NewGuid();
				public string AppId { get; set; } = string.Empty;
				public string LoanProfileName { get; set; } = string.Empty;
				public decimal InterestPerMonth { get; set; }
				public bool ComputePerDay { get; set; }
				public string InterestFactor { get; set; } = "principalBalance";

				public IEnumerable<FixedInterests> Fixed { get; set; } = Array.Empty<FixedInterests>();

		}
}
