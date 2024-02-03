using FinanceProject.Dto;
using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface ITransactionRepo
		{
				public Transaction CreateTransaction(CreateTransactionDto item);

				public Transaction UpdateTransaction(Transaction item);

				public IEnumerable<Transaction> GetByMonth(int year, int month);
				public Transaction? GetOneTransaction(Guid id);

		}
}
