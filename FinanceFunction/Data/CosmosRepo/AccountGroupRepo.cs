using FinanceFunction.Data;
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Data.CosmosRepo
{
		public class AccountGroupRepo : IAccountGroupRepo
		{
				private readonly AppDbContext _context;
				private readonly ILogger<AccountGroupRepo> _logger;

				public AccountGroupRepo(AppDbContext context, ILogger<AccountGroupRepo> logger)
				{
						_context = context;
						_logger = logger;
				}
				public bool Create(AccountGroup group)
				{

						try
						{
								_context.AccountGroups!.AddAsync(group);
								_context.SaveChangesAsync().Wait();
								return true;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message, group);
								throw;
						}
				}

				public ICollection<AccountGroup> GetAccounts()
				{
						try
						{
								var task = _context.AccountGroups!.Where(e => e.Enabled == true).ToArrayAsync();
								task.Wait();
								return task.Result;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								throw;
						}
				}

				public ICollection<AccountGroup> GetByType(Guid id)
				{
						var task = _context.AccountGroups!.Where(f => f.AccountTypeId == id).ToArrayAsync();
						task.Wait();

						return task.Result;

				}
				public AccountGroup? GetOne(Guid id)
				{
						throw new NotImplementedException();
				}
		}
}
