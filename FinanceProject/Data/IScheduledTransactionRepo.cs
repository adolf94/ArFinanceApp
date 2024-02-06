using FinanceProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Data
{
		public interface IScheduledTransactionRepo
		{
				public bool CreateSchedule(ScheduledTransactions schedule);
				public ScheduledTransactions? GetOne(Guid id);
				public IEnumerable<ScheduledTransactions> GetAll();

		}
}
