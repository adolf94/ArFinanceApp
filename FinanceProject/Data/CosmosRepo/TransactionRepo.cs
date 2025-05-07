using AutoMapper;
using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace FinanceApp.Data.CosmosRepo
{
    public class TransactionRepo : ITransactionRepo
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TransactionRepo(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        public Transaction CreateTransaction(Transaction item)
        {


            _context.Transactions!.AddAsync(item).AsTask().Wait();
            _context.SaveChangesAsync().Wait();
            return item;

        }

        public Transaction? GetOneTransaction(Guid id)
        {
            var task = _context.Transactions!.Where(e => e.Id == id).FirstOrDefaultAsync();
            task.Wait();
            return task.Result;
        }


        public IEnumerable<Transaction> GetByMonth(int year, int month)
        {
            var dateStart = new DateTime(year, month, 1);
            var dateEnd = dateStart.AddMonths(1);
            var task = _context.Transactions!.Where(t => t.Date > dateStart && t.Date < dateEnd)
                    .ToListAsync();
            task.Wait();
            return task.Result;
        }

        public Transaction UpdateTransaction(Transaction item)
        {



            _context.SaveChangesAsync().Wait();
            return item;
        }



        public Task SaveChangesAsync(CancellationToken token = default)
        {
            return _context.SaveChangesAsync(token);
        }
        public async Task<IDbContextTransaction> CreateTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public Transaction? GetLastTransactionByAdded()
        {
            var task = _context.Transactions!.OrderByDescending(e => e.DateAdded).FirstOrDefaultAsync();
            task.Wait();
            return task.Result;
        }

        public async Task<IEnumerable<Transaction>> GetTransactionsAfter(Guid id)
        {

            Transaction? afterDate = await _context.Transactions!.FindAsync(id);
            if (afterDate == null) return Array.Empty<Transaction>();

            var items = await _context.Transactions.Where(e => e.DateAdded > afterDate.DateAdded).ToArrayAsync();
            return items;

        }
    }
}
