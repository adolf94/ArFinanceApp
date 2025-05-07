using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface IPaymentRepo
		{
				public Task ApplyPayment(PaymentRecord record);
				public List<LoanPayment> GetByLoanId(Guid loanId);
				public Task<IEnumerable<LoanPayment>> GetLoanPaymentsAsync(Guid loanId);

		}
}
