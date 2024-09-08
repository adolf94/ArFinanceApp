using FinanceApp.Data.SqlRepo;
using FinanceProject.Models;

namespace FinanceProject.Data.SqlRepo
{
		public class AccountTypeRepo : IAccountTypeRepo
		{
				private readonly AppDbContext _context;
				private readonly ILogger<AccountTypeRepo> _logger;

				public AccountTypeRepo(AppDbContext context, ILogger<AccountTypeRepo> logger)
				{
						_context = context;
						_logger = logger;
				}
				public async Task<bool> Create(AccountType accountType)
				{
						try
						{
								await _context.AccountTypes!.AddAsync(accountType);
								await _context.SaveChangesAsync();
								return true;
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message, accountType);
								throw;
						}
				}

				public ICollection<AccountType> GetAllType()
				{
						try
						{

								return _context.AccountTypes!.Where(e => e.Enabled == true).ToArray();
						}
						catch (Exception ex)
						{
								_logger.LogError(ex, ex.Message);
								throw;
						}
				}

				public AccountType? GetOne(Guid id)
				{
						return _context.AccountTypes!.Find(id);
				}
		}
}
