using FinanceProject.Dto;
using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface ITransactionRepo
		{
				public Transaction CreateTransaction(CreateTransactionDto item);
		}
}
