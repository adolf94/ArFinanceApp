using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore.Storage;

namespace FinanceProject.Data
{
		public interface ITransactionRepo
		{
				public Transaction CreateTransaction(CreateTransactionDto item);

				public Transaction UpdateTransaction(Transaction item);

				public IEnumerable<Transaction> GetByMonth(int year, int month);
				public Transaction? GetOneTransaction(Guid id);
				public Transaction? GetLastTransactionByAdded();
				public Task SaveChangesAsync(CancellationToken token = default);
				public Task<IDbContextTransaction> CreateTransactionAsync();
				//public Task<IDbContextTransaction> Rollback();
				//public Task<IDbContextTransaction> Commit();

		}
}
