using System.ComponentModel.DataAnnotations;
using UUIDNext;

namespace FinanceApp.Models
{
		public class PaymentRecord
		{
				public Guid Id { get; set; } = Guid.NewGuid();
				public string AppId { get; set; }
				public Guid UserId { get; set; }
				public DateTime Date { get; set; }
				public DateTime DateAdded { get; set; } = DateTime.Now;

				public Guid? AddedBy { get; set; }

				public string Method { get; set; }
				public string? ReferenceId { get; set; }
				public decimal Amount { get; set; }
				public Guid DestinationAcctId { get; set; }
				public Guid LedgerEntryId { get; set; } = Uuid.NewSequential();

				public List<LoanPayment> LoanPayments { get; set; } = new List<LoanPayment>();
				
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";

		}

}
