using FinanceApp.Models;
using FinanceProject.Models;

namespace FinanceApp.Data
{
    public interface IMonthlyTransactionRepo
    {
        public Task<MonthlyTransaction?> GetOne(string DateKey);
        public Task<MonthlyTransaction> AddToMonthlyTransaction(Transaction transaction, bool save, bool remove = false);

    }
}
