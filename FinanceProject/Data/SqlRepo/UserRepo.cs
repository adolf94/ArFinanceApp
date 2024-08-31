using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.SqlRepo
{
		public class UserRepo : IUserRepo
		{
				private readonly AppDbContext _context;

				public UserRepo(AppDbContext context)
				{
						_context = context;
				}

				public async Task<User?> GetByEmailAsync(string email)
				{
						return await _context.Users!.Where(e => e.EmailAddress == email).FirstOrDefaultAsync();
				}
				public async Task<User?> GetById(string guid)
				{
						return await _context.Users!.FindAsync(Guid.Parse(guid));
				}
		}
}
