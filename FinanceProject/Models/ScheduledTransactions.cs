namespace FinanceProject.Models
{
		public class ScheduledTransactions : Transaction
		{

				public string CronExpression { get; set; } = string.Empty;
				public string CronId { get; set; } = string.Empty;
						
				public Guid? LastTransactionId { get; set; } 

				public DateTime EndDate { get; set; }
		}
}
