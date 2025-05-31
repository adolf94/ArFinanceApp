using FinanceFunction.Dtos;
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace FinanceFunction.Data
{
		public interface ITransactionRepo
		{
				public Transaction CreateTransaction(Transaction item);

				public Transaction UpdateTransaction(Transaction item);

				public IEnumerable<Transaction> GetByMonth(int year, int month);
				public Transaction? GetOneTransaction(Guid id);
				public Transaction? GetLastTransactionByAdded();
				public Task<IEnumerable<Transaction>> GetTransactionsAfter(Guid id);
				public Task SaveChangesAsync(CancellationToken token = default);
				public Task<IDbContextTransaction> CreateTransactionAsync();

		}
}
