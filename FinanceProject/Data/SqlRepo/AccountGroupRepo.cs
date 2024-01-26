using FinanceProject.Models;

namespace FinanceProject.Data.SqlRepo
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
								_context.AccountGroups!.Add(group);
								_context.SaveChanges();
								return true;
						}catch(Exception ex)
						{
								_logger.LogError(ex, ex.Message, group);
								throw;
						}
				}

				public ICollection<AccountGroup> GetAccounts()
				{
						try
						{
								return _context.AccountGroups!.Where(e=>e.Enabled == true).ToArray();
						}catch(Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								throw;
						}
				}

				public ICollection<AccountGroup> GetByType(Guid id)
				{

						return _context.AccountGroups!.Where(f=>f.AccountTypeId==id).ToArray();

				} 
				public AccountGroup? GetOne(Guid id)
				{
						throw new NotImplementedException();
				}
		}
}
