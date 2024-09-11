using AutoMapper;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Data.CosmosRepo.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Models = FinanceProject.Models;

namespace FinanceApp.Data.CosmosRepo
{
		public class AccountBalanceRepo : IAccountBalanceRepo
		{
				private readonly AppDbContext _context;
				private readonly IMemoryCache _cache;
				private readonly ILogger<AccountBalanceRepo> _logger;
				private readonly IMapper _mapper;

				public AccountBalanceRepo(AppDbContext context, IMemoryCache cache, ILogger<AccountBalanceRepo> logger, IMapper mapper)
				{
						_context = context;
						_cache = cache;
						_logger = logger;
						_mapper = mapper;
				}

				public async Task CreateAccountBalances(DateTime date)
				{
						string acc_bal_key = $"acc_bal_{date.Year}_{date.Month}";
						string? nil;
						_cache.TryGetValue(acc_bal_key, out nil);
						if (nil != null) return;
						_logger.LogDebug($"CreateAccountBalances {acc_bal_key} triggered");

						long InternalDate = new DateTime(date.Year, date.Month, 1).ToEpoch();


						//items1.Wait();

						//return;

						bool any = await _context.AccountBalances!.AnyAsync(e => e.Month == InternalDate);
						if (!any)
						{

								List<AccountBalance> items = new List<AccountBalance>();
								List<Account> accounts = await _context.Accounts!.ToListAsync();

								accounts.ForEach(async acc =>
								{
										long currentPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).ToEpoch();
										long prevPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).AddMonths(-1).ToEpoch();
										AccountBalance? currentBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && currentPeriod == b.Month).FirstOrDefaultAsync();
										if (currentBal != null) return;
										AccountBalance? accBal = await _context.AccountBalances!.Where(b => b.AccountId == acc.Id && prevPeriod == b.Month).FirstOrDefaultAsync();
										if (accBal == null && !acc.ResetEndOfPeriod)
										{
												_logger.LogTrace($"accBal for {acc.Id} {prevPeriod}");
												decimal prevTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < currentPeriod)
												.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();

												items.Add(new AccountBalance
												{
														AccountId = acc.Id,
														Balance = prevTotal,
														Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay).ToEpoch(),
												});
										}
										else
										{
												_logger.LogTrace($"accBal for {acc.Id} {prevPeriod}");

												decimal monthTotal = await _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date > prevPeriod && t.Date <= currentPeriod)
														.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).SumAsync();


												items.Add(new AccountBalance
												{
														AccountId = acc.Id,
														Balance = (accBal == null ? 0 : accBal.Balance) + monthTotal,
														Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay).ToEpoch()
												});

										}



								});



								await _context.AccountBalances!.AddRangeAsync(items);
								await _context.SaveChangesAsync();
						}
						_cache.Set(acc_bal_key, "t");
				}
				public IEnumerable<Models.AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{

						Task<Account?> acctTask = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
						acctTask.Wait();
						Models.Account? acct = acctTask.Result;
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();
						if (acct.ResetEndOfPeriod)
						{
								//Credit card are not included here as we need running balance on monthly basis
								//This is for Income/Expense Account
								long thisDate = new DateTime(date.Year, date.Month, 1).ToEpoch();
								Task<AccountBalance?> balTask = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month == thisDate)
								.FirstOrDefaultAsync();

								balTask.Wait();
								var bal = balTask.Result;
								if (bal != null) balance.Add(bal);
						}
						else
						{
								long dateEpoch = date.ToEpoch();
								var balanceTask = _context.AccountBalances!.Where(e => e.AccountId == creditId && e.Month > dateEpoch)
										.ToListAsync();
								balanceTask.Wait();
								balance = balanceTask.Result;
						}



						balance.ForEach(bal =>
						{
								bal.Balance += amount;
						});

						_context.SaveChangesAsync().Wait();
						return balance.Select(e => _mapper.Map<Models.AccountBalance>(e));

				}


				public IEnumerable<Models.AccountBalance> UpdateDebitAcct(Guid debitId, decimal amount, DateTime date)
				{



						Models.Account? acct = _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefault();
						if (acct == null) throw new Exception("Account not found");
						CreateAccountBalances(date.AddDays(1 - acct.PeriodStartDay)).Wait();
						List<AccountBalance> balance = new List<AccountBalance>();

						if (acct.ResetEndOfPeriod)
						{
								//Credit card are not included here as we need running balance on monthly basis
								//This is for Income/Expense Account
								long nextPeriod = new DateTime(date.Year, date.Month, 1).AddMonths(1).ToEpoch();
								Task<AccountBalance?> balTask = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month == nextPeriod)
								.FirstOrDefaultAsync();
								balTask.Wait();

								if (balTask.Result != null) balance.Add(balTask.Result);
						}
						else
						{

								//For Credit Cards
								//Outstanding Balance (Despite, usual definition is total including Unbilled Installments, Our definition is to be paid at end of month)

								//Outstanding Balance ==> Account balance based on table Accounts
								//  How to include the Unbilled Installment for this month?? 
								//  Include scheduled?? 
								//Statement Balance ==> {Outstanding Balance } minus Account Balance from AccountBalance table (for ongoing month (+1)) 
								long dateEpoch = date.ToEpoch();
								var taskBalance = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month > dateEpoch)
										.ToListAsync();
								taskBalance.Wait();
								balance = taskBalance.Result;
						}

						balance.ForEach(bal =>
						{
								bal.Balance -= amount;
						});

						_context.SaveChanges();
						return balance.Select(e => _mapper.Map<Models.AccountBalance>(e));

				}


				public Models.AccountBalance? GetByAccountWithDate(Guid account, DateTime date)
				{

						long longDate = new DateTime(date.Year, date.Month, 1).ToEpoch();

						var result = _context.AccountBalances!.Where(ab => ab.AccountId == account && ab.Month == longDate).FirstOrDefaultAsync();
						result.Wait();

						return _mapper.Map<Models.AccountBalance>(result.Result);


				}



				public IQueryable<Models.AccountBalance> GetByDate(DateTime date)
				{
						long EDate = date.ToEpoch();
						long nextEDate = date.AddMonths(1).ToEpoch();
						return _context.AccountBalances!.Where(ab => ab.Account!.PeriodStartDay == 1 ? (ab.Month == EDate)
																												: (ab.Month == nextEDate))
																								.ToArray().Select(e => _mapper.Map<Models.AccountBalance>(e)).AsQueryable();


						//TODO -- logic for Credit cards 
				}

				public IQueryable<Models.AccountBalance> GetByDateCredit(DateTime date)
				{
						return Array.Empty<Models.AccountBalance>().AsQueryable();
				}
		}
}
