namespace FinanceProject.Models
{
		public class WeeklyBalance
		{

				public Guid AccountId { get; set; }
				public Account? Account { get; set; }
				public DateTime StartDate { get; set; }

				public decimal StartBalance { get; set; }
				public decimal EndBalance { get; set; }

				public string PartitionKey { get; } = "default";

		}
}
