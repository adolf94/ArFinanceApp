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
								return true;
						}catch(Exception ex)
						{
								_logger.LogError(ex, ex.Message, group);
								throw;
						}
				}

				public ICollection<Account> GetAccounts()
				{
						throw new NotImplementedException();
				}

				public Account? GetOne(Guid id)
				{
						throw new NotImplementedException();
				}
		}
}
