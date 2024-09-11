using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Data.CosmosRepo.Models;
using FinanceProject.Dto;
using Microsoft.EntityFrameworkCore;
using NCrontab;
using Models = FinanceProject.Models;

namespace FinanceApp.Data.CosmosRepo
{
		public class ScheduledTransactionRepo : IScheduledTransactionRepo
		{
				private readonly AppDbContext _context;
				private readonly ITransactionRepo _transactions;
				private readonly IAccountRepo _accounts;
				private readonly IAccountBalanceRepo _balances;
				private PersistentConfig _conf;
				private readonly IMapper _mapper;

				public ScheduledTransactionRepo(AppDbContext context, ITransactionRepo transactions, IAccountRepo accounts,
						IAccountBalanceRepo balances, PersistentConfig conf, IMapper mapper)
				{
						_context = context;
						_transactions = transactions;
						_accounts = accounts;
						_balances = balances;
						_conf = conf;
						_mapper = mapper;
				}

				public bool CreateSchedule(Models.ScheduledTransactions schedule)
				{
						ScheduledTransactions schd = _mapper.Map<ScheduledTransactions>(schedule);
						_context.ScheduledTransactions!.AddAsync(schd).AsTask().Wait();
						_context.SaveChangesAsync().Wait();
						return true;

				}

				public Models.ScheduledTransactions? GetOne(Guid id)
				{
						var data = _context.ScheduledTransactions!.FindAsync(id);
						data.AsTask().Wait();
						return _mapper.Map<Models.ScheduledTransactions>(data.Result);

				}

				public IEnumerable<Models.ScheduledTransactions> GetAll()
				{
						var task = _context.ScheduledTransactions!.ToArrayAsync();
						task.Wait();

						return task.Result.Select(e => _mapper.Map<Models.ScheduledTransactions>(e));
				}

				public Models.ScheduledTransactions? GetNextTransaction()
				{
						var task = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.UtcNow.ToEpoch())
								.FirstOrDefaultAsync();
						task.Wait();
						return _mapper.Map<Models.ScheduledTransactions?>(task.Result);
				}

				public void SetNextTransaction()
				{
						var task = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.UtcNow.ToEpoch())
								.Select(e => e.NextTransactionDate).FirstOrDefaultAsync();
						task.Wait();
						_conf.NextScheduledTransactionDate = DateTime.UnixEpoch.AddSeconds(task.Result);
				}



				public IEnumerable<Models.ScheduledTransactions> ProcessScheduledTransactions()
				{
						List<ScheduledTransactions> items = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate < DateTime.UtcNow.ToEpoch()).ToList();
						if (!items.Any()) return items;

						bool errorOccured = false;

						foreach (ScheduledTransactions e in items)
						{


								DateTime forAcctBalance = DateTime.UnixEpoch.AddSeconds(e.NextTransactionDate);
								CrontabSchedule scd = CrontabSchedule.Parse(e.CronExpression);
								while (forAcctBalance > DateTime.UtcNow)
								{
										_balances.CreateAccountBalances(forAcctBalance);
										forAcctBalance = scd.GetNextOccurrence(forAcctBalance);
								}


								//using (var transaction = _context.Database.BeginTransaction())
								//{
								try
								{
										long nextTransaction = e.NextTransactionDate;

										while (nextTransaction < DateTime.UtcNow.ToEpoch() && e.LastTransactionDate >= nextTransaction)
										{

												Transaction tr = _context.Transactions!.Find(e.LastTransactionId)!;

												_accounts.UpdateCreditAcct(tr.CreditId, tr.Amount);
												_accounts.UpdateDebitAcct(tr.DebitId, tr.Amount);

												_balances.UpdateCreditAcct(tr.CreditId, tr.Amount, DateTime.UnixEpoch.AddSeconds(nextTransaction));
												_balances.UpdateDebitAcct(tr.DebitId, tr.Amount, DateTime.UnixEpoch.AddSeconds(nextTransaction));

												CreateTransactionDto newTr = new CreateTransactionDto
												{
														Id = Guid.NewGuid(),
														CreditId = tr.CreditId,
														DebitId = tr.DebitId,
														Amount = tr.Amount,
														Date = DateTime.UnixEpoch.AddSeconds(nextTransaction),
														VendorId = tr.VendorId,
														Description = $"{e.LastTransactionIndex + 1} of {e.TotalOccurence}. "

												};

												_transactions.CreateTransaction(newTr);

												e.LastTransactionDate = nextTransaction;
												e.LastTransactionId = newTr.Id;
												e.LastTransactionIndex = e.LastTransactionIndex + 1;

												nextTransaction = scd.GetNextOccurrence(DateTime.UnixEpoch.AddSeconds(nextTransaction)).ToEpoch();
												e.NextTransactionDate = nextTransaction;
										}
										_context.SaveChanges();

										//transaction.Commit();
								}
								catch (Exception ex)
								{
										//transaction.Rollback();
										errorOccured = true;
										_conf.ScheduleHasErrors = true;
										break;
								}
								//}
						};
						if (!errorOccured)
						{
								SetNextTransaction();
						}

						return items.Select(e => _mapper.Map<Models.ScheduledTransactions>(e));

				}
		}
}
