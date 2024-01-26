using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceProject.Data.SqlRepo
{
		public class AccountBalanceRepo : IAccountBalanceRepo
		{
				private readonly AppDbContext _context;

				public AccountBalanceRepo(AppDbContext context)
				{
						_context = context;
				}

				public void CreateAccountBalances(DateTime date)
				{

						if(!_context.AccountBalances!.Any(e=>e.Month == date.Month &&  e.Year == date.Year))
						{

								DateTime prevMonth = date.AddMonths(-1);
								IEnumerable<AccountBalance> items = _context.Accounts!.ToArray().Select(acc =>
								{
										AccountBalance? accBal = _context.AccountBalances!.Where(b => b.AccountId == acc.Id && prevMonth.Year == b.Year &&
												prevMonth.Month == b.Month).FirstOrDefault();
										if (accBal == null)
										{
												decimal prevTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && t.Date < date)
												.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();

												return new AccountBalance
												{
														AccountId = acc.Id,
														Balance = accBal!.Balance + prevTotal,
														Month = date.Month,
														Year = date.Year
												};
										}
										else
										{

												decimal monthTotal = _context.Transactions!.Where(t => (t.CreditId == acc.Id || t.DebitId == acc.Id) && prevMonth.Month == t.Date.Month && prevMonth.Year == t.Date.Year)
														.Select(t => (t.CreditId == acc.Id ? t.Amount : t.DebitId == acc.Id ? -t.Amount : 0)).Sum();


												return new AccountBalance
												{
														AccountId = acc.Id,
														Balance = accBal.Balance + monthTotal,
														Month = date.Month,
														Year = date.Year
												};

										}



								}).ToList();



								_context.AccountBalances!.AddRange(items);		
								_context.SaveChanges();
						}
				}
				public IEnumerable<AccountBalance> UpdateCreditAcct(Guid creditId, decimal amount, DateTime date)
				{
						List<AccountBalance> balance = _context.AccountBalances!.Where(e => e.AccountId == creditId &&  EF.Functions.DateFromParts(e.Year, e.Month,1) > date )
								.ToList();


						balance.ForEach(bal =>
						{
								bal.Balance += amount;
						});

						_context.SaveChanges();
						return balance;

				}


				public IEnumerable<AccountBalance> UpdateDebitAcct(Guid debitId, decimal amount, DateTime date)
				{

						List<AccountBalance> balance = _context.AccountBalances!.Where(e => e.AccountId == debitId && EF.Functions.DateFromParts(date.Year,date.Month,date.Month) < EF.Functions.DateFromParts(e.Year, e.Month, 1))
								.ToList();


						balance.ForEach(bal =>
						{
								bal.Balance -= amount;
						});

						_context.SaveChanges();
						return balance;

				}


		}
}
