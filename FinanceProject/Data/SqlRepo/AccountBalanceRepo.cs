using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FinanceProject.Data.SqlRepo
{
		public class AccountBalanceRepo : IAccountBalanceRepo
		{
				private readonly AppDbContext _context;
				private readonly IMemoryCache _cache;

				public AccountBalanceRepo(AppDbContext context, IMemoryCache cache)
				{
						_context = context;
						_cache = cache;
				}

				public void CreateAccountBalances(DateTime date)
				{
						string acc_bal_key = $"acc_bal_{date.Year}_{date.Month}";
						string? nil;
						if (_cache.TryGetValue(date, out nil)) return;

						if (!_context.AccountBalances!.Any(e => e.Month.Year == date.Year && e.Month.Month == date.Month))
						{

								IEnumerable<AccountBalance> items = _context.Accounts!.ToArray().Select(acc =>
								{
										DateTime currentPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay);
										DateTime prevPeriod = new DateTime(date.Year, date.Month, acc.PeriodStartDay).AddMonths(-1);
										AccountBalance? accBal = _context.AccountBalances!.Where(b => b.AccountId == acc.Id && prevPeriod == b.Month).FirstOrDefault();
										if (accBal == null && !acc.ResetEndOfPeriod)
										{
												decimal prevTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < currentPeriod)
												.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();

												return new AccountBalance
												{
														AccountId = acc.Id,
														Balance = prevTotal,
														Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
												};
										}
										else
										{

												decimal monthTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date > prevPeriod && t.Date <= currentPeriod)
														.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();


												return new AccountBalance
												{
														AccountId = acc.Id,
														Balance = (accBal == null ? 0 : accBal.Balance) + monthTotal,
														Month = new DateTime(date.Year, date.Month, acc.PeriodStartDay)
												};

										}



								}).ToList();



								_context.AccountBalances!.AddRange(items);
								_context.SaveChanges();
						}
						_cache.Set(acc_bal_key, "t");
				}
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{


						Account? acct = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefault();
						if (acct == null) throw new Exception("Account not found");
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
						List<AccountBalance> balance = new List<AccountBalance>();


						if (acct.ResetEndOfPeriod)
						{
								DateTime nextPeriod = date.AddMonths(1);
								AccountBalance? bal = _context.AccountBalances!.Where(e => e.AccountId == debitId && e.Month == EF.Functions.DateFromParts(nextPeriod.Year, nextPeriod.Month, acct.PeriodStartDay))
								.FirstOrDefault();


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



				public IEnumerable<AccountBalance> GetByDate(DateTime date)
				{
						return _context.AccountBalances!.Where(ab => ab.Month.Year == date.Year && ab.Month.Month == date.Month).ToArray();
				}


		}
}
