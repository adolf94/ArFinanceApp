using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface IScheduledTransactionRepo
		{
				public Task<bool> CreateSchedule(ScheduledTransactions schedule);
				public Task<ScheduledTransactions?> GetOne(Guid id);
				public Task<ScheduledTransactions?> ApplyScheduledTransaction(Transaction transaction);
				public Task<List<ScheduledTransactions>> GetAll();
				public Task<List<ScheduledTransactions>> GetPendingTransactions();

				public IEnumerable<ScheduledTransactions> ProcessScheduledTransactions();
				public void SetNextTransaction();

		}
}
