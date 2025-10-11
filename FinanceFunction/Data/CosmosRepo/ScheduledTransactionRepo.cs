using Cronos;
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class ScheduledTransactionRepo: IScheduledTransactionRepo
		{
				private readonly AppDbContext _context;

				public ScheduledTransactionRepo(AppDbContext context)
				{
					_context = context;
				}

				public async Task<ScheduledTransactions?> ApplyScheduledTransaction(Transaction transaction)
				{
						var schedule = await _context.ScheduledTransactions!.Where(e=>e.Id == transaction.ScheduleId).FirstOrDefaultAsync();
						var currentDate = transaction.Date.ToUniversalTime();
						var scheduleCron = CronExpression.Parse(schedule!.CronExpression);
						var nextDate = scheduleCron.GetNextOccurrence(currentDate);
						schedule.LastTransactionDate = transaction.Date.ToUniversalTime();
						schedule.NextTransactionDate = nextDate!.Value;
						schedule.LastTransactionId = transaction.Id;
						schedule.LastTransactionIndex = schedule.LastTransactionIndex + 1;
						schedule.TransactionIds.Add(transaction.Id.ToString());
						if(schedule.LastTransactionIndex >= schedule.Iterations)
						{
							schedule.Enabled = false;					
						}



						await _context.SaveChangesAsync();
						return schedule;

				}

				public async Task<bool> CreateSchedule(ScheduledTransactions schedule)
				{
						await _context.ScheduledTransactions!.AddAsync(schedule);
						return true;

				}

				public Task<List<ScheduledTransactions>> GetAll()
				{
						return _context.ScheduledTransactions!.Where(e => e.Enabled).ToListAsync();
				}

				public Task<ScheduledTransactions?> GetOne(Guid id)
				{
						return _context.ScheduledTransactions!.Where(e => e.Id == id).FirstOrDefaultAsync();
				}

				public async Task<List<ScheduledTransactions>> GetPendingTransactions()
				{
						var now = DateTime.UtcNow;
						var data = await _context.ScheduledTransactions!.Where(e => e.NextTransactionDate <= now
							&& e.Enabled == true
						
						).ToListAsync();
						return data;
				}

				public IEnumerable<ScheduledTransactions> ProcessScheduledTransactions()
				{
						throw new NotImplementedException();
				}

				public void SetNextTransaction()
				{
						throw new NotImplementedException();
				}
		}
}
