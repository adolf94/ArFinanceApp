using FinanceApp.Models.SubModels;

namespace FinanceApp.Models
{
		public class Loans
		{
				public Guid Id { get; set; } = Guid.NewGuid();
				public string AppId { get; set; } = string.Empty;

				public Guid UserId { get; set; }
				public Guid CoborrowerId { get; set; }
				public Guid CreatedBy { get; set; }


				public DateTime Date { get; set; }
				public DateTime DateCreated { get; set; } = DateTime.Now;
				public DateTime? DateClosed { get; set; }
				public DateTime NextInterestDate { get; set; }
				public DateTime LastInterestDate { get; set; }
				public DateTime[] ExpectedPayments { get; set; } = Array.Empty<DateTime>();
				public DisbursementAccount? DisbursementAccount { get; set; }
				public decimal Principal { get; set; }
				public decimal Interests { get; set; }
				public decimal TotalInterestPercent { get; set; }
				public NoNavigationLoanProfile LoanProfile { get; set; } = new NoNavigationLoanProfile();

				public List<LoanPayment> Payment { get; set; } = new List<LoanPayment>();
				public List<LoanInterest> InterestRecords { get; set; } = new List<LoanInterest>();
				public string Status { get; set; } = "Active";


				public class LoanInterest
				{
						public DateTime DateCreated { get; set; }
						public DateTime DateStart { get; set; }
						public DateTime DateEnd { get; set; }
						public decimal Amount { get; set; }
				}

		}

		public class NoNavigationLoanProfile : LoanProfile { }
}
