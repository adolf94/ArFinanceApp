using FinanceApp.BgServices;
using FinanceProject.Dto;
using FinanceProject.Models;
using NCrontab;

namespace FinanceProject.Data.SqlRepo
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

				public ScheduledTransactions? GetNextTransaction()
				{
						return _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.UtcNow).FirstOrDefault();
				}

				public void SetNextTransaction()
				{
						DateTime? next = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate > DateTime.UtcNow).Select(e => e.NextTransactionDate).FirstOrDefault();

						_conf.NextScheduledTransactionDate = next;
				}



				public IEnumerable<ScheduledTransactions> ProcessScheduledTransactions()
				{
						List<ScheduledTransactions> items = _context.ScheduledTransactions!.Where(e => e.NextTransactionDate < DateTime.UtcNow).ToList();
						if (!items.Any()) return items;

						bool errorOccured = false;

						foreach (ScheduledTransactions e in items)
						{


								DateTime forAcctBalance = e.NextTransactionDate;
								CrontabSchedule scd = CrontabSchedule.Parse(e.CronExpression);
								while (forAcctBalance > DateTime.UtcNow)
								{
										_balances.CreateAccountBalances(forAcctBalance);
										forAcctBalance = scd.GetNextOccurrence(forAcctBalance);
								}


								using (var transaction = _context.Database.BeginTransaction())
								{
										try
										{
												DateTime nextTransaction = e.NextTransactionDate;

												while (nextTransaction < DateTime.UtcNow && e.LastTransactionDate >= nextTransaction)
												{

														Transaction tr = _context.Transactions!.Find(e.LastTransactionId)!;

														_accounts.UpdateCreditAcct(tr.CreditId, tr.Amount);
														_accounts.UpdateDebitAcct(tr.DebitId, tr.Amount);

														_balances.UpdateCreditAcct(tr.CreditId, tr.Amount, nextTransaction);
														_balances.UpdateDebitAcct(tr.DebitId, tr.Amount, nextTransaction);

														CreateTransactionDto newTr = new CreateTransactionDto
														{
																Id = Guid.NewGuid(),
																CreditId = tr.CreditId,
																DebitId = tr.DebitId,
																Amount = tr.Amount,
																Date = nextTransaction,
																VendorId = tr.VendorId,
																Description = $"{e.LastTransactionIndex + 1} of {e.TotalOccurence}. "

														};

														_transactions.CreateTransaction(newTr);

														e.LastTransactionDate = nextTransaction;
														e.LastTransactionId = newTr.Id;
														e.LastTransactionIndex = e.LastTransactionIndex + 1;

														nextTransaction = scd.GetNextOccurrence(nextTransaction);
														e.NextTransactionDate = nextTransaction;
												}
												_context.SaveChanges();

												transaction.Commit();
										}
										catch (Exception ex)
										{
												transaction.Rollback();
												errorOccured = true;
												_conf.ScheduleHasErrors = true;
												break;
										}
								}
						};
						if (!errorOccured)
						{
								SetNextTransaction();
						}

						return items;

				}
		}
}
