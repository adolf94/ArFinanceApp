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


				public async Task<AccountBalance?> CreateAccountBalanceOne(DateTime date, Account acc, bool SaveChanges)
				{

						DateTime currentPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay);
						AccountBalance? currentBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && b.Year == date.Year && b.Month == date.Month).FirstOrDefaultAsync();
						if (currentBal != null) return currentBal;

						DateTime prevPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).AddMonths(-1);
						AccountBalance? accBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && b.Month == prevPeriod.Month && b.Year == prevPeriod.Year).FirstOrDefaultAsync();

						if (accBal == null && !acc.ResetEndOfPeriod)
						//if the account has no previous data, wala kasing pag babasan ng balance
						//reset end of period == FALSE in case na meron pa before
						{
								_logger.LogTrace($"accBal for {acc.Id} {prevPeriod.ToShortDateString()}");
								decimal prevTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < currentPeriod)
								// less than Current period kasi we just need the current month start
								.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();

								currentBal = new AccountBalance
								{
										AccountId = acc.Id,
										Balance = prevTotal,
										Year = date.Year,
										Month = date.Month,
										DateStart = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
								};
						}
						else
						//if may previos balance na OR nagrereset -- kukunin lang natin yung previous month
						//
						{
								_logger.LogTrace($"accBal for {acc.Id} {prevPeriod.ToShortDateString()}");

								decimal monthTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date > prevPeriod && t.Date <= currentPeriod)
										.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();
								decimal balanceLastMonth = accBal == null ? 0 : accBal.Balance;
								decimal balanceToSave = monthTotal;
								//add natin if d naman magrereset (save natin running balance)
								if (!acc.ResetEndOfPeriod) balanceToSave = balanceLastMonth + monthTotal;
								currentBal = new AccountBalance
								{
										AccountId = acc.Id,
										Balance = balanceToSave,
										Year = date.Year,
										Month = date.Month,
										DateStart = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
								};

						}

						await _context.AccountBalances!.AddAsync(currentBal);
						if (SaveChanges) await _context.SaveChangesAsync();
						return currentBal;
				}

				public async Task CreateAccountBalances(DateTime date)
				{
						string acc_bal_key = $"acc_bal_{date.Year}_{date.Month}";
						string? nil;
						_cache.TryGetValue(acc_bal_key, out nil);
						if (nil != null) return;
						DateTime dateIn = new DateTime(date.Year, date.Month, 1);
						_logger.LogDebug($"CreateAccountBalances {acc_bal_key} triggered");
						var anyIten = await _context.AccountBalances!.Where(e => e.Month == date.Month && e.Year == date.Year).FirstOrDefaultAsync();
						if (anyIten == null)
						{

								List<AccountBalance> items = new List<AccountBalance>();
								List<Account> accounts = await _context.Accounts!.ToListAsync();

								accounts.ForEach(acc =>
								{
										var task = CreateAccountBalanceOne(date, acc, false);
										task.Wait();
								});



								await _context.SaveChangesAsync();
						}
						_cache.Set(acc_bal_key, "t");
				}



				public async Task<AccountBalance> CreateBalances(Account acct, DateTime month)
				{
					DateTime currentPeriod = new DateTime(month.Year, month.Month, 1);
					DateTime prevPeriod = new DateTime(month.Year, month.Month, 1).AddMonths(-1);

					
					
					List<AccountBalance> balancesToAdd = new List<AccountBalance>();
					if (prevPeriod < acct.MinMonth)
					{
						//Create account balanced previous months
						DateTime period = prevPeriod;
						while (period < acct.MinMonth)
						{
							var newBalance = new AccountBalance()
							{
								AccountId = acct.Id,
								Year = period.Year,
								Month = period.Month,
								DateStart = new DateTime(period.Year, period.Month, acct.PeriodStartDay),
								DateEnd = new DateTime(period.Year, period.Month, acct.PeriodStartDay).AddMonths(1),
							};
							balancesToAdd.Add(newBalance);
							period = period.AddMonths(1);
						}
					}
					if (prevPeriod < acct.MinMonth)
					{
						//Create account balanced previous months
						DateTime period = prevPeriod;
						while (period < acct.MinMonth)
						{
							var newBalance = new AccountBalance()
							{
								AccountId = acct.Id,
								Year = period.Year,
								Month = period.Month,
								DateStart = new DateTime(period.Year, period.Month, acct.PeriodStartDay),
								DateEnd = new DateTime(period.Year, period.Month, acct.PeriodStartDay).AddMonths(1),
							};
							balancesToAdd.Add(newBalance);
							period = period.AddMonths(1);
						}
					}

					if (currentPeriod > acct.MaxMonth)
					{
						
						DateTime period = acct.MaxMonth.AddMonths(1);
						while (period >= acct.MinMonth)
						{
							var newBalance = new AccountBalance()
							{
								AccountId = acct.Id,
								Year = period.Year,
								Month = period.Month,
								Balance = acct.Balance,
								EndingBalance = acct.Balance,
								DateStart = new DateTime(period.Year, period.Month, acct.PeriodStartDay),
								DateEnd = new DateTime(period.Year, period.Month, acct.PeriodStartDay).AddMonths(1),
							};
							balancesToAdd.Add(newBalance);
							period = period.AddMonths(1);
						}
					}

					if (balancesToAdd.Any())
					{
						await _context.AccountBalances!.AddRangeAsync(balancesToAdd);
						await _context.SaveChangesAsync();
					}

					var item = await _context.AccountBalances!.FirstOrDefaultAsync(e =>
						e.Id == $"{month.Year}/{month.Month}/{acct.Id}");
					
					return item;

				}
				

				public async Task<IEnumerable<AccountBalance>> UpdateCrAccount(Guid creditId, decimal amount, DateTime month)
				{
					Account? acct = await _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
					if (acct == null) throw new Exception("Account not found");
					bool isPrevPeriod = acct.PeriodStartDay < month.Day;
					List<AccountBalance> balance = new List<AccountBalance>();
					DateTime currentPeriod = new DateTime(month.Year, month.Month, 1);
					DateTime prevPeriod = new DateTime(month.Year, month.Month, 1).AddMonths(-1);
					
					
				}
				
				
				
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{

						Task<Account?> acctTask = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
						acctTask.Wait();
						Account? acct = acctTask.Result;
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();
						if (acct.ResetEndOfPeriod)
						{
								//This part is for Expense and Income
								DateTime nextPeriod = date.AddMonths(1);
								var nextPeriodMonth = new DateTime(nextPeriod.Year, nextPeriod.Month, 1);
								Task<AccountBalance?> balTask = CreateAccountBalanceOne(date, acct, false);

								balTask.Wait();
								var bal = balTask.Result;
								if (bal != null) balance.Add(bal);
						}
						else
						{
								//Assets and Liabilities
								//Update the next periods balanc
								var balanceTask = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.DateStart > date)
										.ToListAsync();
								balanceTask.Wait();
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



						var acctTask = _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefaultAsync();
						acctTask.Wait();
						Account? acct = acctTask.Result;
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();

						if (acct.ResetEndOfPeriod)
						{
								//for expense and income
								DateTime nextPeriod = date.AddMonths(1);
								var nextPeriodMonth = new DateTime(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay);


								Task<AccountBalance?> balTask = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.DateStart == nextPeriodMonth)
								.FirstOrDefaultAsync();
								balTask.Wait();

								if (balTask.Result != null) balance.Add(balTask.Result);
						}
						else
						{
								//for assets and liabilities
								var taskBalance = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.DateStart > date)
										.ToListAsync();
								taskBalance.Wait();
								balance = taskBalance.Result;
						}

						balance.ForEach(bal =>
						{
								bal.Balance -= amount;
						});

						_context.SaveChangesAsync().Wait();
						return balance;

				}


				public AccountBalance? GetByAccountWithDate(Guid account, DateTime date)
				{


						throw new NotImplementedException();


				}



				public IQueryable<AccountBalance> GetByDate(DateTime date)
				{
						throw new NotImplementedException();
						//TODO -- logic for Credit cards 
				}

				public IQueryable<AccountBalance> GetByDateCredit(DateTime date)
				{
						throw new NotImplementedException();
				}
		}
}
