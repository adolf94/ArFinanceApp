﻿using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
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
								_context.Accounts!.AddAsync(group).AsTask().Wait();
								_context.SaveChangesAsync().Wait();

								_context.AccountBalances!.AddAsync(new AccountBalance
								{
										AccountId = group.Id,
										Balance = 0m,
										DateStart = new DateTime(DateTime.Now.Year, DateTime.Now.Month, group.PeriodStartDay),
										Year = DateTime.Now.Year,
										Month = DateTime.Now.Month,
								}).AsTask().Wait();
								if (group.Balance != 0)
								{
										_context.Transactions!.AddAsync(new Transaction
										{
												DebitId = group.Id,
												CreditId = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"),
												Amount = group.Balance,
												Description = "Modified Balance",
												Date = DateTime.Now,
												DateAdded = DateTime.Now
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



				public Account UpdateDebitAcct(Guid debitId, decimal amount)
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
						return debit;

				}

				public Account UpdateCreditAcct(Guid creditId, decimal amount)
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

						return credit;

				}

				public ICollection<Account> GetAccounts(bool All = false)
				{
						try
						{
								IQueryable<Account> query = _context.Accounts!;

								if (!All) query = query.Where(e => e.Enabled == true);
								var queryTask = query.ToArrayAsync();
								queryTask.Wait();
								return queryTask.Result;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								return Array.Empty<Account>();
						}
				}

				public Account? GetOne(Guid id)
				{
						var task = _context.Accounts!.Where(e => e.Id == id).FirstOrDefaultAsync();
						task.Wait();
						return task.Result;
				}
		}
}