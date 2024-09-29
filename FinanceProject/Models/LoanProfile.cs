namespace FinanceApp.Models
{
		public class LoanProfile
		{
				public Guid ProfileId { get; set; }
				public string AppId { get; set; } = string.Empty;
				public string LoanProfileName { get; set; } = string.Empty;
				public decimal InterestPerMonth { get; set; }
				public bool ComputePerDay { get; set; }
				public string InterestFactor { get; set; } = "principalBalance";

				public FixedInterests[] Fixed { get; set; } = Array.Empty<FixedInterests>();

				public class FixedInterests
				{
						public int MaxDays { get; set; }
						public decimal Interest { get; set; }
				}
		}
}
