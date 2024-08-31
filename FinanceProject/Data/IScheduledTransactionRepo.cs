using FinanceProject.Models;

namespace FinanceProject.Data
{
		public interface IScheduledTransactionRepo
		{
				public bool CreateSchedule(ScheduledTransactions schedule);
				public ScheduledTransactions? GetOne(Guid id);
				public IEnumerable<ScheduledTransactions> GetAll();

				public IEnumerable<ScheduledTransactions> ProcessScheduledTransactions();
				public void SetNextTransaction();


		}
}
