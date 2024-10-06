using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface IPaymentRepo
		{
				public Task ApplyPayment(PaymentRecord record);

		}
}
