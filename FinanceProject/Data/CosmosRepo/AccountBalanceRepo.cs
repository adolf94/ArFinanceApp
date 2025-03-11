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

				//Deprecate
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

								currentBal = new AccountBalance( date.Year, date.Month, acc.Id,acc.PeriodStartDay)
								{
										AccountId = acc.Id,
										Balance = prevTotal
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
								currentBal = new AccountBalance( date.Year, date.Month, acc.Id,acc.PeriodStartDay)
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



				public async Task<AccountBalance?> GetOne(Account acct, DateTime date)
				{
					if (acct.MaxMonth < date || acct.MinMonth > date)
					{
						return new AccountBalance( date.Year, date.Month, acct.Id,acct.PeriodStartDay)
						{
							Balance = acct.MinMonth > date? 0  : acct.Balance,
							EndingBalance = acct.MinMonth > date? 0 : acct.Balance,
							Account = acct,
							PartitionKey = "default",
							Transactions = new List<AccountBalance.BalanceTransaction>()
						};
					}
					else
					{
						var item = await _context.AccountBalances!.Where(e => e.Id == $"{date.Year}|{date.Month:D2}|{acct.Id}")
							.FirstOrDefaultAsync();
						return item;
					}
				}
				
				
				
				
				//Deprecate
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



				public async Task<AccountBalance> CreateBalances(Account acct, DateTime month, bool save = true)

				{
					DateTime currentPeriod = new DateTime(month.Year, month.Month, 1);
					DateTime prevPeriod = new DateTime(month.Year, month.Month, 1).AddMonths(-1);
					bool isPrevPeriod = acct.PeriodStartDay >= month.Day;

					
					
					List<AccountBalance> balancesToAdd = new List<AccountBalance>();
					if (prevPeriod < acct.MinMonth)
					{
						//Create account balanced previous months
						DateTime period = prevPeriod;
						while (period < acct.MinMonth)
						{
							var newBalance = new AccountBalance(period.Year,period.Month,acct.Id,acct.PeriodStartDay);
							balancesToAdd.Add(newBalance);
							acct.MinMonth = period;
							period = period.AddMonths(1);
						}
					}

					if (currentPeriod > acct.MaxMonth)
					{
						
						DateTime period = acct.MaxMonth.AddMonths(1);
						while (period <= currentPeriod)
						{
							var newBalance = new AccountBalance(period.Year,period.Month,acct.Id,acct.PeriodStartDay)
							{
								Balance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
								EndingBalance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
							};
							balancesToAdd.Add(newBalance);
							acct.MaxMonth = period;
							period = period.AddMonths(1);
						}
					}

					if (balancesToAdd.Any())
					{
						await _context.AccountBalances!.AddRangeAsync(balancesToAdd);
						if(save) await _context.SaveChangesAsync();
					}

					string balanceKey = isPrevPeriod?$"{prevPeriod.Year}|{prevPeriod.Month:D2}|{acct.Id}" 
									: $"{currentPeriod.Year}|{currentPeriod.Month:D2}|{acct.Id}"  ;
					
					
					var item = await _context.AccountBalances!.FirstOrDefaultAsync(e =>
						e.Id == balanceKey);
					
					return item!;

				}


				public async Task<IEnumerable<AccountBalance>> UpdateCrAccount(Guid creditId, decimal amount,
					Guid transaction, DateTime date, bool reverse = false, bool save = true)
				{
					Account? acct = await _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
					if (acct == null) throw new Exception("Account not found");
					List<AccountBalance> balance = new List<AccountBalance>();

					AccountBalance bal = await CreateBalances(acct, date);
					bal.EndingBalance -= amount;

					if (reverse)
					{
						bal.Transactions = bal.Transactions.Where(e=>e.TransactionId != transaction).ToList();
					}
					else
					{
						bal.Transactions.Add(new AccountBalance.BalanceTransaction()
						{
							TransactionId = transaction,
							Amount = -amount
						});
					}
					
					balance.Add(bal);
					if (!acct.ResetEndOfPeriod)
					{
						var balances =await _context.AccountBalances!.Where(e => e.AccountId == creditId && e.DateStart > date)
							.ToListAsync();
						
						balance.AddRange(balances.Select(b =>
						{
							b.Balance -= amount;
							b.EndingBalance -= amount;
							return b;
						}).ToArray());
					}
					
					if(save)await _context.SaveChangesAsync();
					return balance;

				}

				public async Task<IEnumerable<AccountBalance>> UpdateDrAccount(Guid debitId, decimal amount, 
					Guid transaction, DateTime date, bool reverse = false, bool save = true)
				{
					Account? acct = await _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefaultAsync();
					if (acct == null) throw new Exception("Account not found");
					List<AccountBalance> balance = new List<AccountBalance>();

					AccountBalance bal = await CreateBalances(acct, date);
					bal.EndingBalance += amount;

					if (reverse)
					{
						bal.Transactions = bal.Transactions.Where(e=>e.TransactionId != transaction).ToList();
					}
					else
					{
						bal.Transactions.Add(new AccountBalance.BalanceTransaction()
						{
							TransactionId = transaction,
							Amount = -amount
						});
					}
					balance.Add(bal);
					if (!acct.ResetEndOfPeriod)
					{
						var balances =await _context.AccountBalances!.Where(e => e.AccountId == debitId && e.DateStart > date)
							.ToListAsync();
						
						balance.AddRange(balances.Select(b =>
						{
							b.Balance += amount;
							b.EndingBalance += amount;
							return b;
						}).ToArray());
					}
					
					if(save)await _context.SaveChangesAsync();

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
