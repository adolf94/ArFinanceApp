namespace FinanceApp.Models
{
		public class PaymentRecord
		{
				public Guid Id { get; set; }
				public string AppId { get; set; }
				public Guid UserId { get; set; }
				public DateTime Date { get; set; }
				public string Method { get; set; }
				public decimal Amount { get; set; }

				public List<LoanPayment> LoanPayments { get; set; } = new List<LoanPayment>();
		}

		public class PaymentAppliedTo
		{
				public Guid LoanId { get; set; }
				public decimal Amount { get; set; }
				public bool AgainstPrincipal { get; set; }

		}
}
