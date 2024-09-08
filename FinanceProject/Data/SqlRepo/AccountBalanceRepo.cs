using FinanceApp.Data.SqlRepo;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FinanceProject.Data.SqlRepo
{
		public class AccountBalanceRepo : IAccountBalanceRepo
		{
				private readonly AppDbContext _context;
				private readonly IMemoryCache _cache;
				private readonly ILogger<AccountBalanceRepo> _logger;

				public AccountBalanceRepo(AppDbContext context, IMemoryCache cache, ILogger<AccountBalanceRepo> logger)
				{
						_context = context;
						_cache = cache;
						_logger = logger;
				}

				public Task CreateAccountBalances(DateTime date)
				{
						string acc_bal_key = $"acc_bal_{date.Year}_{date.Month}";
						string? nil;
						_cache.TryGetValue(acc_bal_key, out nil);
						if (nil != null) return Task.CompletedTask;
						_logger.LogDebug($"CreateAccountBalances {acc_bal_key} triggered");
						if (!_context.AccountBalances!.Any(e => e.Month.Year == date.Year && e.Month.Month == date.Month))
						{

								List<AccountBalance> items = new List<AccountBalance>();
								_context.Accounts!.ToList().ForEach(acc =>
						{
								DateTime currentPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay);
								DateTime prevPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).AddMonths(-1);
								AccountBalance? accBal = _context.AccountBalances!.Where(b => b.AccountId == acc.Id && prevPeriod == b.Month).FirstOrDefault();
								AccountBalance? currentBal = _context.AccountBalances!.Where(b => b.AccountId == acc.Id && currentPeriod == b.Month).FirstOrDefault();
								if (currentBal != null) return;
								if (accBal == null && !acc.ResetEndOfPeriod)
								{
										_logger.LogTrace($"accBal for {acc.Id} {prevPeriod.ToShortDateString()}");
										decimal prevTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < currentPeriod)
										.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();

										items.Add(new AccountBalance
										{
												AccountId = acc.Id,
												Balance = prevTotal,
												Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
										});
								}
								else
								{
										_logger.LogTrace($"accBal for {acc.Id} {prevPeriod.ToShortDateString()}");

										decimal monthTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date > prevPeriod && t.Date <= currentPeriod)
												.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();


										items.Add(new AccountBalance
										{
												AccountId = acc.Id,
												Balance = (accBal == null ? 0 : accBal.Balance) + monthTotal,
												Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
										});

								}



						});



								_context.AccountBalances!.AddRange(items);
								_context.SaveChanges();
						}
						_cache.Set(acc_bal_key, "t");
						return Task.CompletedTask;
				}
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{

						Account? acct = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefault();
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay));
						List<AccountBalance> balance = new List<AccountBalance>();
						if (acct.ResetEndOfPeriod)
						{
								DateTime nextPeriod = date.AddMonths(1);
								AccountBalance? bal = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month == EF.Functions.DateFromParts(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay))
								.FirstOrDefault();


								if (bal != null) balance.Add(bal);
						}
						else
						{

								balance = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month > date)
										.ToList();

						}



						balance.ForEach(bal =>
						{
								bal.Balance += amount;
						});

						_context.SaveChanges();
						return balance;

				}


				public IEnumerable<AccountBalance> UpdateDebitAcct(Guid debitId, decimal amount, DateTime date)
				{



						Account? acct = _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefault();
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay));
						List<AccountBalance> balance = new List<AccountBalance>();

						if (acct.ResetEndOfPeriod)
						{
								DateTime nextPeriod = date.AddMonths(1);
								AccountBalance? bal = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month == EF.Functions.DateFromParts(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay))
								.FirstOrDefault();

								//For Credit Cards
								//Outstanding Balance (Despite, usual definition is total including Unbilled Installments, Our definition is to be paid at end of month)

								//Outstanding Balance ==> Account balance based on table Accounts
								//  How to include the Unbilled Installment for this month?? 
								//  Include scheduled?? 
								//Statement Balance ==> {Outstanding Balance } minus Account Balance from AccountBalance table (for ongoing month (+1)) 


								if (bal != null) balance.Add(bal);
						}
						else
						{

								balance = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month > date)
										.ToList();

						}

						balance.ForEach(bal =>
						{
								bal.Balance -= amount;
						});

						_context.SaveChanges();
						return balance;

				}


				public AccountBalance? GetByAccountWithDate(Guid account, DateTime date)
				{
						return _context.AccountBalances!.Where(ab => ab.AccountId == account && ab.Month.Year == date.Year && ab.Month.Month == date.Month).FirstOrDefault();
				}



				public IQueryable<AccountBalance> GetByDate(DateTime date)
				{
						return _context.AccountBalances!.Where(ab => !ab.Account!.ResetEndOfPeriod ? (ab.Month.Year == date.Year && ab.Month.Month == date.Month)
																												: (EF.Functions.DateFromParts(ab.Month.Year, ab.Month.Month, ab.Account.PeriodStartDay) < date
																														&& EF.Functions.DateFromParts(ab.Month.Year, ab.Month.Month + 1, ab.Account.PeriodStartDay) >= date));
						//TODO -- logic for Credit cards 
				}

				public IQueryable<AccountBalance> GetByDateCredit(DateTime date)
				{
						return _context.AccountBalances!.Where(ab => ab.Account!.AccountGroup!.isCredit && (EF.Functions.DateFromParts(ab.Month.Year, ab.Month.Month, ab.Account.PeriodStartDay) < date
																														&& EF.Functions.DateFromParts(ab.Month.Year, ab.Month.Month + 1, ab.Account.PeriodStartDay) >= date));
				}
		}
}
