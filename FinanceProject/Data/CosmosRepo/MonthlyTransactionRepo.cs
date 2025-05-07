using FinanceApp.Models;
using FinanceProject.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
    public class MonthlyTransactionRepo : IMonthlyTransactionRepo
    {
        private readonly AppDbContext _context;

        public MonthlyTransactionRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MonthlyTransaction?> GetOne(string DateKey)
        {
            return await _context.MonthTransactions.Where(e=>e.MonthKey == DateKey).FirstOrDefaultAsync();

        }

        public async Task<MonthlyTransaction> AddToMonthlyTransaction(Transaction transaction, bool save, bool remove = false)
        {
            string key = transaction.Date.ToString("yyyy-MM-01");

            MonthlyTransaction? item = await _context.MonthTransactions.Where(e => e.MonthKey == key).FirstOrDefaultAsync();

            if(item == null)
            {
                item = new MonthlyTransaction { MonthKey = key, PartitionKey = "default" }; 
                _context.MonthTransactions.Add(item);
            }

            if (remove)
            {
                var toRemove = item.Transactions.FirstOrDefault(e => e.Id == transaction.Id);
                if(toRemove != null )item.Transactions.Remove(toRemove);

            }
            else
            {
                item.Transactions.Add(new MonthlyTransaction.TransactionRef { EpochUpdated = transaction.EpochUpdated, Id = transaction.Id });
            }


            if (save)await _context.SaveChangesAsync();

            return item;

        }
    }
}
