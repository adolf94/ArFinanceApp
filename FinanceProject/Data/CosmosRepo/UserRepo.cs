using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class UserRepo : IUserRepo
		{
				private readonly AppDbContext _context;

				public UserRepo(AppDbContext context)
				{
						_context = context;
				}

				public async Task<User> CreateUser(User user)
				{
						_context.Users!.Add(user);
						await _context.SaveChangesAsync();
						return user;
				}
				public async Task<User> UpdateUser(User user)
				{
						_context.Entry(user).State = EntityState.Modified;
						await _context.SaveChangesAsync();
						return user;
				}

				public async Task<User?> GetByEmailAsync(string email)
				{
						return await _context.Users!.Where(e => e.EmailAddress == email).FirstOrDefaultAsync();

				}
				public async Task<User?> GetById(Guid guid)
				{
						return await _context.Users!.FindAsync(guid);
				}

				public async Task<User?> GetByMobile(string mobile)
				{
						return await _context.Users!.Where(e => e.MobileNumber == mobile).FirstOrDefaultAsync();
				}

				public async Task<User[]> GetAll()
				{
						return await _context.Users!.ToArrayAsync();
				}
		}
}
