namespace FinanceProject.Models
{
		public class AccountType
		{
				public Guid Id { get; set; } = new Guid();

				public string? Name { get; set; }
				public bool Enabled { get; set; }
				public bool ShouldResetPeriodically { get; set; }
		}
}
