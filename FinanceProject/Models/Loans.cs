namespace FinanceApp.Models
{
		public class Loans
		{
				public Guid Id { get; set; }
				public string AppId { get; set; } = string.Empty;

				public Guid UserId { get; set; }
				public Guid CoborrowerId { get; set; }

				public DateTime DateCreated { get; set; }
				public DateTime Date { get; set; }
				public DateTime NextInterestDate { get; set; }
				public DateTime LastInterestDate { get; set; }
				public DateTime[] ExpectedPayments { get; set; } = Array.Empty<DateTime>();

				public decimal Principal { get; set; }
				public decimal Interests { get; set; }
				public LoanProfile LoanProfile { get; set; } = new LoanProfile();

				public LoanPayment[] Payment { get; set; } = Array.Empty<LoanPayment>();
				public LoanInterest[] InterestRecords { get; set; } = Array.Empty<LoanInterest>();

				public string Status { get; set; } = "Active";

				public class LoanPayment
				{
						public Guid PaymentId { get; set; }
						public decimal Amount { get; set; }
						public bool AgainstPrincipal { get; set; }
				}

				public class LoanInterest
				{
						public DateTime DateCreated { get; set; }
						public DateTime DateStart { get; set; }
						public DateTime DateEnd { get; set; }
						public decimal Amount { get; set; }
				}

		}
}
