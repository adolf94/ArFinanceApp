using FinanceFunction.Models;
using FinanceFunction.Models;

namespace FinanceFunction.Data
{
    public interface IMonthlyTransactionRepo
    {
        public Task<MonthlyTransaction?> GetOne(string DateKey);
        public Task<MonthlyTransaction> AddToMonthlyTransaction(Transaction transaction, bool save, bool remove = false);

    }
}
