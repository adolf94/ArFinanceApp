using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FinanceApp.Data.CosmosRepo
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

				public async Task CreateAccountBalances(DateTime date)
				{
						string acc_bal_key = $"acc_bal_{date.Year}_{date.Month}";
						string? nil;
						_cache.TryGetValue(acc_bal_key, out nil);
						if (nil != null) return;
						DateTime dateIn = new DateTime(date.Year, date.Month, 1);
						_logger.LogDebug($"CreateAccountBalances {acc_bal_key} triggered");
						var anyIten = await _context.AccountBalances!.Where(e => e.Month == date).FirstOrDefaultAsync();
						if (anyIten == null)
						{

								List<AccountBalance> items = new List<AccountBalance>();
								List<Account> accounts = await _context.Accounts!.ToListAsync();

								accounts.ForEach(async acc =>
								{
										DateTime currentPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay);
										DateTime prevPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).AddMonths(-1);
										AccountBalance? currentBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && currentPeriod == b.Month).FirstOrDefaultAsync();
										if (currentBal != null) return;
										AccountBalance? accBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && prevPeriod == b.Month).FirstOrDefaultAsync();
										if (accBal == null && !acc.ResetEndOfPeriod)
										{
												_logger.LogTrace($"accBal for {acc.Id} {prevPeriod.ToShortDateString()}");
												decimal prevTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < currentPeriod)
												.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();

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

												decimal monthTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date > prevPeriod && t.Date <= currentPeriod)
														.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();


												items.Add(new AccountBalance
												{
														AccountId = acc.Id,
														Balance = (accBal == null ? 0 : accBal.Balance) + monthTotal,
														Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
												});

										}



								});



								await _context.AccountBalances!.AddRangeAsync(items);
								await _context.SaveChangesAsync();
						}
						_cache.Set(acc_bal_key, "t");
				}
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{

						Task<Account?> acctTask = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
						acctTask.Wait();
						Account? acct = acctTask.Result;
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();
						if (acct.PeriodStartDay != 1)
						{
								DateTime nextPeriod = date.AddMonths(1);
								var nextPeriodMonth = new DateTime(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay)
								Task<AccountBalance?> balTask = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month == nextPeriodMonth)
								.FirstOrDefaultAsync();

								balTask.Wait();
								var bal = balTask.Result;
								if (bal != null) balance.Add(bal);
						}
						else
						{

								var balanceTask = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month > date)
										.ToListAsync();
								balance = balanceTask.Result;
						}



						balance.ForEach(bal =>
						{
								bal.Balance += amount;
						});

						_context.SaveChangesAsync().Wait();
						return balance;

				}


				public IEnumerable<AccountBalance> UpdateDebitAcct(Guid debitId, decimal amount, DateTime date)
				{



						Account? acct = _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefault();
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();

						if (acct.ResetEndOfPeriod)
						{

								DateTime nextPeriod = date.AddMonths(1);
								var nextPeriodMonth = new DateTime(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay)


								Task<AccountBalance?> balTask = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month == nextPeriodMonth)
								.FirstOrDefaultAsync();

								//For Credit Cards
								//Outstanding Balance (Despite, usual definition is total including Unbilled Installments, Our definition is to be paid at end of month)

								//Outstanding Balance ==> Account balance based on table Accounts
								//  How to include the Unbilled Installment for this month?? 
								//  Include scheduled?? 
								//Statement Balance ==> {Outstanding Balance } minus Account Balance from AccountBalance table (for ongoing month (+1)) 
								balTask.Wait();

								if (balTask.Result != null) balance.Add(balTask.Result);
						}
						else
						{

								var taskBalance = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month > date)
										.ToListAsync();
								balance = taskBalance.Result;
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
						DateTime compareDate = new DateTime(date.Year, date.Month, 1);
						var result = _context.AccountBalances!.Where(ab => ab.AccountId == account && ab.Month.Year == date.Year && ab.Month.Month == date.Month).FirstOrDefaultAsync();
						result.Wait();

						return result.Result;


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
