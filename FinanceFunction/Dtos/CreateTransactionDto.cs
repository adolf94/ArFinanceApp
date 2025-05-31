namespace FinanceFunction.Dtos;
		public class CreateTransactionDto
		{
				public Guid Id { get; set; }
				public Guid CreditId { get; set; }
				public Guid? VendorId { get; set; }
				public Guid DebitId { get; set; }
				public decimal Amount { get; set; }
				public DateTime Date { get; set; }
				public string Type { get; set; }

				public List<string> Notifications { get; set; } = new List<string>();

				public string Description { get; set; } = string.Empty;
		}
