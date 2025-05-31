
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Data.CosmosRepo
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

				public async Task<ICollection<AccountType>> GetAllType()
				{
						var types = await _context.AccountTypes!.ToArrayAsync();


						return types;

				}

				public AccountType? GetOne(Guid id)
				{
						var item = _context.AccountTypes!.Where(e => e.Id == id).FirstOrDefaultAsync();
						item.Wait();
						return item.Result;
				}
		}
}
