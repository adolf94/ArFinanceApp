using FinanceProject.Models;

namespace FinanceProject.Data.SqlRepo
{
		public class AccountRepo : IAccountRepo
		{
				private readonly AppDbContext _context;
				private readonly ILogger<AccountRepo> _logger;

				public AccountRepo(AppDbContext context, ILogger<AccountRepo> logger)
				{
						_context = context;
						_logger = logger;
				}
				public bool Create(Account group)
				{
						try
						{
								_context.Accounts!.Add(group);
								_context.SaveChanges();
								_context.AccountBalances!.Add(new AccountBalance
								{
										AccountId = group.Id,
										Balance = 0m,
										Month = DateTime.Now.Month,
										Year = DateTime.Now.Year
								});
								if(group.Balance != 0)
								{		
										_context.Transactions!.Add(new Transaction
										{
												DebitId = group.Id,
												CreditId = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"),
												Amount = group.Balance,
												Description = "Modified Balance",
												Date = DateTime.Now,
												DateAdded = DateTime.Now
										});
								}
								_context.SaveChanges();
								return true;
						}catch(Exception ex)
						{
								_logger.LogError(ex, ex.Message, group);
								throw;
						}
				}



				public Account UpdateDebitAcct(Guid debitId, decimal amount)
				{
						Account? debit = _context.Accounts!.Find(debitId);
						if (debit == null)
						{
								throw new InvalidOperationException("Account was not found");
						}
						else
						{
								debit.Balance += amount;
								_context.Entry(debit).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
						}
						_context.SaveChanges();
						return debit;

				}

				public Account UpdateCreditAcct(Guid creditId, decimal amount)
				{
						Account? credit = _context.Accounts!.Find(creditId);
						if (credit == null)
						{
								throw new InvalidOperationException("Account was not found");
						}
						else
						{
								credit.Balance += -amount;
								_context.Entry(credit).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
						}

						_context.SaveChanges();
						return credit;

				}

				public ICollection<Account> GetAccounts(bool All = false)
				{
						try
						{
								IQueryable<Account> query = _context.Accounts!;

								if (!All) query = query.Where(e => e.Enabled == true);
										
										return query.ToArray();
						}catch(Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								return Array.Empty<Account>();
						}
				}

				public Account? GetOne(Guid id)
				{
						return _context.Accounts!.Where(e => e.Id == id).FirstOrDefault();
				}
		}
}
