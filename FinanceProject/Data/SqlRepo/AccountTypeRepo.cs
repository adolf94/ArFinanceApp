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
				public bool Create(AccountType accountType)
				{
						try
						{
								_context.AccountTypes!.Add(accountType);
								_context.SaveChanges();
								return true;
						}catch(Exception ex) {
								_logger.LogError(ex, ex.Message, accountType);
								throw;
						}
				}

				public ICollection<AccountType> GetAllType()
				{
						throw new NotImplementedException();
				}

				public AccountType? GetOne(Guid id)
				{
						return _context.AccountTypes!.Find(id);
				}
		}
}
