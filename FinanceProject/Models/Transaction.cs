namespace FinanceProject.Models
{
		public class Transaction
		{
				public Guid Id { get; set; } = new Guid();

				public Guid CreditId { get; set; }
				public Account? Credit { get; set; }
				public string Type { get; set; } = "";
				public Guid DebitId { get; set; }
				public Account? Debit { get; set; }
				public decimal Amount { get; set; }
				public Guid? AddByUserId { get; set; }
				public User? AddByUser { get; set; }
				public Guid? VendorId { get; set; }
				public Vendor? Vendor { get; set; }
				public DateTime Date { get; set; }
				public DateTime DateAdded { get; set; } = DateTime.UtcNow;
				public string Description { get; set; }
		}
}
