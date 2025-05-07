using FinanceApp.BgServices;
using FinanceProject.Data;
using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NCrontab;

namespace FinanceApp.Data.CosmosRepo
{
		public class ScheduledTransactionRepo : IScheduledTransactionRepo
		{
				private readonly AppDbContext _context;
				private readonly ITransactionRepo _transactions;
				private readonly IAccountRepo _accounts;
				private readonly IAccountBalanceRepo _balances;
				private PersistentConfig _conf;

				public ScheduledTransactionRepo(AppDbContext context, ITransactionRepo transactions, IAccountRepo accounts, IAccountBalanceRepo balances, PersistentConfig conf)
				{
						_context = context;
						_transactions = transactions;
						_accounts = accounts;
						_balances = balances;
						_conf = conf;
				}

				public bool CreateSchedule(ScheduledTransactions schedule)
				{
						_context.ScheduledTransactions!.AddAsync(schedule).AsTask().Wait();
						_context.SaveChangesAsync().Wait();
						return true;

				}

				public ScheduledTransactions? GetOne(Guid id)
				{
						var task = _context.ScheduledTransactions!.FindAsync(id);
						task.AsTask();
						return task.Result;
				}

				public IEnumerable<ScheduledTransactions> GetAll()
				{
						var task = _context.ScheduledTransactions!.ToArrayAsync();
						task.Wait();
						return task.Result;
				}

				public ScheduledTransactions? GetNextTransaction()
				{
						var task = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.Now).FirstOrDefaultAsync();
						task.Wait();
						return task.Result;
				}

				public void SetNextTransaction()
				{
						var task = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.Now).Select(e => e.NextTransactionDate)
								.FirstOrDefaultAsync();
						task.Wait();

						_conf.NextScheduledTransactionDate = task.Result;
				}



				public IEnumerable<ScheduledTransactions> ProcessScheduledTransactions()
				{
						List<ScheduledTransactions> items = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate < DateTime.Now).ToList();
						if (!items.Any()) return items;

						bool errorOccured = false;

						foreach (ScheduledTransactions e in items)
						{


								DateTime forAcctBalance = e.NextTransactionDate;
								CrontabSchedule scd = CrontabSchedule.Parse(e.CronExpression);
								// while (forAcctBalance > DateTime.UtcNow)
								// {
								// 		_balances.CreateAccountBalances(forAcctBalance);
								// 		forAcctBalance = scd.GetNextOccurrence(forAcctBalance);
								// }

								//
								// using (var transaction = _context.Database.BeginTransaction())
								// {
										try
										{
												DateTime nextTransaction = e.NextTransactionDate;

												while (nextTransaction < DateTime.UtcNow && e.LastTransactionDate >= nextTransaction)
												{

														Transaction tr = _context.Transactions!.Find(e.LastTransactionId)!;

														var cr = _accounts.UpdateCreditAcct(tr.CreditId, tr.Amount);
														var dr = _accounts.UpdateDebitAcct(tr.DebitId, tr.Amount);
														Guid id = Guid.CreateVersion7();

														var crBal =  _balances.CreateBalances(cr,
															nextTransaction).GetAwaiter().GetResult();
														var drBal = _balances.CreateBalances(dr,
															nextTransaction).GetAwaiter().GetResult();

															Transaction newTr = new Transaction()
															{
																Id = id,
																CreditId = tr.CreditId,
																DebitId = tr.DebitId,
																Amount = tr.Amount,
																Date = nextTransaction,
																VendorId = tr.VendorId,
																EpochUpdated = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds(),
																Description = $"{e.LastTransactionIndex + 1} of {e.TotalOccurence}. ",
																BalanceRefs = new[]{
																										new BalanceAccount(){ AccountBalanceKey = crBal.Id, AccountId = tr.CreditId , IsDebit = false },
																										new BalanceAccount(){ AccountBalanceKey = drBal.Id, AccountId = tr.CreditId , IsDebit = true }
																									}.ToList()
															};
														_balances.UpdateCrAccount(newTr);
														_balances.UpdateDrAccount(newTr);


														_transactions.CreateTransaction(newTr);

														e.LastTransactionDate = nextTransaction;
														e.LastTransactionId = newTr.Id;
														e.LastTransactionIndex = e.LastTransactionIndex + 1;

														nextTransaction = scd.GetNextOccurrence(nextTransaction);
														e.NextTransactionDate = nextTransaction;
												}
												_context.SaveChanges();

												// transaction.Commit();
										}
										catch (Exception ex)
										{
												// transaction.Rollback();
												errorOccured = true;
												_conf.ScheduleHasErrors = true;
												break;
										}
								// }
						};
						if (!errorOccured)
						{
								SetNextTransaction();
						}

						return items;

				}
		}
}
