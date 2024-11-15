using FinanceApp.BgServices;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class UserRepo : IUserRepo
		{
				private readonly AppDbContext _context;
				private UrlReminderConfig _urlRemind;

				public UserRepo(AppDbContext context, UrlReminderConfig urlReminderConfig)
				{
						_context = context;
						_urlRemind = urlReminderConfig;
				}

				public Task SetLastUrlReminder(Guid guid, string appId, DateTime lastReminder)
				{
					if (!_urlRemind.Data.ContainsKey($"{appId}_{guid.ToString()}"))
					{
						_urlRemind.Data.Add($"{appId}_{guid.ToString()}", lastReminder);
						return Task.CompletedTask;
					}
					
					
					_urlRemind.Data["{appId}_{guid.ToString()}"] = lastReminder;
					return Task.CompletedTask;

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

				public async Task<DateTime> GetLastUrlReminder(Guid guid, string appId )
				{
					
					if (!_urlRemind.Data.ContainsKey($"{appId}_{guid.ToString()}"))
					{
						_urlRemind.Data.Add($"{appId}_{guid.ToString()}", DateTime.MinValue);
						return await Task.FromResult(DateTime.MinValue);
					}
					
					return (_urlRemind.Data[$"{appId}_{guid.ToString()}"]);
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
