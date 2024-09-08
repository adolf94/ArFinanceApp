using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
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
						await _context.AccountTypes!.AddAsync(accountType);
						return true;
				}

				public ICollection<AccountType> GetAllType()
				{
						var types = _context.AccountTypes!.ToArrayAsync();

						types.Wait();

						return types.Result;

				}

				public AccountType? GetOne(Guid id)
				{
						var item = _context.AccountTypes!.Where(e => e.Id == id).FirstOrDefaultAsync();
						item.Wait();
						return item.Result;
				}
		}
}
