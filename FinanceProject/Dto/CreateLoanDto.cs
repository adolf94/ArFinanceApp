using FinanceApp.Models;
using FinanceApp.Models.SubModels;

namespace FinanceApp.Dto
{
		public class CreateLoanDto
		{
				public Guid UserId { get; set; }
				public Guid CoborrowerId { get; set; }

				public DateTime Date { get; set; }
				public DateTime[] ExpectedPayments { get; set; } = Array.Empty<DateTime>();
				public NoNavigationLoanProfile LoanProfile { get; set; } = new NoNavigationLoanProfile();
				public DisbursementAccount? DisbursementAccount { get; set; }
				public decimal Principal { get; set; }
		}

}
