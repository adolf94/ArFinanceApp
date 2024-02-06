using FinanceProject.Models;

namespace FinanceProject.Data.SqlRepo
{
		public class ScheduledTransactionRepo:IScheduledTransactionRepo
		{
				private readonly AppDbContext _context;

				public ScheduledTransactionRepo(AppDbContext context)
				{
						_context = context;
				}

				public bool CreateSchedule(ScheduledTransactions schedule)
				{
						_context.ScheduledTransactions!.Add(schedule); 
						_context.SaveChanges();
						return true;

				}

				public ScheduledTransactions? GetOne(Guid id)
				{
						return _context.ScheduledTransactions!.Find(id);
				}

				public IEnumerable<ScheduledTransactions> GetAll()
				{
						return _context.ScheduledTransactions!.ToArray();
				}
		}
}
