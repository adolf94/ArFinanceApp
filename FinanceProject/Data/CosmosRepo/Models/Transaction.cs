using FinanceApp.Utilities;
using FinanceProject.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceProject.Data.CosmosRepo.Models
{
		public class Transaction
		{
				public Guid Id { get; set; } = new Guid();

				public string Type { get; set; } = "";

				public Guid CreditId { get; set; }
				public Account? Credit { get; set; }

				public Guid DebitId { get; set; }
				public Account? Debit { get; set; }

				public decimal Amount { get; set; }
				public Guid? AddByUserId { get; set; }
				public User? AddByUser { get; set; }

				public Guid? VendorId { get; set; }
				public Vendor? Vendor { get; set; }

				public long Date { get; set; }
				public string StrDate
				{
						get
						{
								return DateTime.UnixEpoch.AddSeconds(Date).ToString("yyyy-MM-dd hh:mm:ss");
						}
						set
						{
								Date = DateTime.Parse(value).ToEpoch();
						}
				}
				public long DateAdded { get; set; }
				public Guid? ScheduleId { get; set; }
				[NotMapped]
				public ScheduledTransactions? Schedule { get; set; }
				public string Description { get; set; } = "";
		}
}
