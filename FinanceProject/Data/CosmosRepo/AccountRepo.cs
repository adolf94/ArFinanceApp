using AutoMapper;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Data.CosmosRepo.Models;
using Microsoft.EntityFrameworkCore;
using Models = FinanceProject.Models;

namespace FinanceApp.Data.CosmosRepo
{
		public class AccountRepo : IAccountRepo
		{
				private readonly AppDbContext _context;
				private readonly ILogger<AccountRepo> _logger;
				private readonly IMapper _mapper;

				public AccountRepo(AppDbContext context, ILogger<AccountRepo> logger, IMapper mapper)
				{
						_context = context;
						_logger = logger;
						_mapper = mapper;
				}
				public bool Create(Models.Account group)
				{

						Account acct = _mapper.Map<Account>(group);
						try
						{
								_context.Accounts!.AddAsync(acct).AsTask().Wait();
								_context.SaveChangesAsync().Wait();
								_context.AccountBalances!.AddAsync(new AccountBalance
								{
										AccountId = acct.Id,
										Balance = 0m,
										Month = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).ToEpoch()
								}).AsTask().Wait();
								if (acct.PeriodStartDay > 1)
								{
										_context.AccountBalances!.AddAsync(new AccountBalance
										{
												AccountId = acct.Id,
												Balance = 0m,
												Month = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-1).ToEpoch()
										}).AsTask().Wait();
								}
								if (acct.Balance != 0)
								{
										_context.Transactions!.AddAsync(new Transaction
										{
												DebitId = acct.Id,
												CreditId = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"),
												Amount = acct.Balance,
												Description = "Modified Balance",
												Date = DateTime.Now.ToEpoch(),
												DateAdded = DateTime.Now.ToEpoch()
										}).AsTask().Wait();
								}
								_context.SaveChangesAsync().Wait();
								return true;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message, group);
								throw;
						}
				}



				public Models.Account UpdateDebitAcct(Guid debitId, decimal amount)
				{
						var debitTask = _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefaultAsync();
						debitTask.Wait();
						var debit = debitTask.Result;
						if (debit == null)
						{
								throw new InvalidOperationException("Account was not found");
						}
						else
						{
								debit.Balance += amount;
								//_context.Entry(debit).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
						}
						return _mapper.Map<Models.Account>(debit);

				}

				public Models.Account UpdateCreditAcct(Guid creditId, decimal amount)
				{
						var creditTask = _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
						creditTask.Wait();
						var credit = creditTask.Result;
						if (credit == null)
						{
								throw new InvalidOperationException("Account was not found");
						}
						else
						{
								credit.Balance += -amount;
								//_context.Entry(credit).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
						}

						return _mapper.Map<Models.Account>(credit);

				}

				public ICollection<Models.Account> GetAccounts(bool All = false)
				{
						try
						{
								IQueryable<Account> query = _context.Accounts!;

								if (!All) query = query.Where(e => e.Enabled == true);
								var queryTask = query.ToArrayAsync();
								queryTask.Wait();
								var preaccts = queryTask.Result;
								return preaccts.Select(e => _mapper.Map<Models.Account>(e)).ToList();
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								return Array.Empty<Models.Account>();
						}
				}

				public Models.Account? GetOne(Guid id)
				{
						var task = _context.Accounts!.Where(e => e.Id == id).FirstOrDefaultAsync();
						task.Wait();
						return _mapper.Map<Models.Account>(task.Result);
				}
		}
}
