namespace FinanceApp.BgServices
{
		public class PersistentConfig
		{
				public DateTime NextScheduledTransactionDate { get; set; }
				public string LastTransactionId { get; set; } = string.Empty;
				public bool ScheduleHasErrors { get; set; } = false;
		}
}
