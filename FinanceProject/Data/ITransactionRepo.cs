using FinanceProject.Dto;

namespace FinanceProject.Data
{
		public interface ITransactionRepo
		{
				public NewTransactionResponseDto CreateTransaction(CreateTransactionDto item);
		}
}
