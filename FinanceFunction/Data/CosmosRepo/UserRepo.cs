using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.EntityFrameworkCore;

namespace FinanceFunction.Data.CosmosRepo
{
		public class UserRepo : IUserRepo
		{
				private readonly AppDbContext _context;
				private readonly CurrentUser _usr;

				//private UrlReminderConfig _urlRemind;

				public UserRepo(AppDbContext context, CurrentUser usr)/*, UrlReminderConfig urlReminderConfig*/
				{
						_context = context;
						_usr = usr; 
						//_urlRemind = urlReminderConfig;
				}

				public Task SetLastUrlReminder(Guid guid, string appId, DateTime lastReminder)
				{
					//if (!_urlRemind.Data.ContainsKey($"{appId}_{guid.ToString()}"))
					//{
					//	_urlRemind.Data.Add($"{appId}_{guid.ToString()}", lastReminder);
					//	return Task.CompletedTask;
					//}
					
					
					//_urlRemind.Data["{appId}_{guid.ToString()}"] = lastReminder;
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
					
					//if (!_urlRemind.Data.ContainsKey($"{appId}_{guid.ToString()}"))
					//{
					//	_urlRemind.Data.Add($"{appId}_{guid.ToString()}", DateTime.MinValue);
					//	return await Task.FromResult(DateTime.MinValue);
					//}
					
					//return (_urlRemind.Data[$"{appId}_{guid.ToString()}"]);
					return await Task.FromResult(DateTime.Now.AddDays(1));
				}

				public async Task<User?> GetByMobile(string mobile)
				{
						return await _context.Users!.Where(e => e.MobileNumber == mobile).FirstOrDefaultAsync();
				}

				public async Task<User[]> GetAll()
				{
						return await _context.Users!.ToArrayAsync();
				}

				public async Task<LoginLog?> CreateLoginLog(string JwtId, Guid userId)
				{
						byte[] originalBytes = System.Text.Encoding.UTF8.GetBytes(UUIDNext.Uuid.NewRandom().ToString());
						string base64String = Convert.ToBase64String(originalBytes);

						string refreshToken = base64String;


						var exist = await _context.LoginLogs.Where(e => e.JwtId == JwtId).FirstOrDefaultAsync();

						if (exist != null) return null;

						var item = new LoginLog
						{
								JwtId = JwtId,
								UserId = userId,
								IsExpired = false,
								RefreshToken = refreshToken,
								MovingExpiry = DateTime.UtcNow.AddDays(7),
								Expiry = DateTime.UtcNow.AddDays(30)
						};


						_context.LoginLogs.Add(item);
						await _context.SaveChangesAsync();
						return item;
				}

				public async Task<LoginLog> GetLoginLog(string Sid)
				{
						var item = await _context.LoginLogs.Where(e => e.Id == Sid 
								&& e.IsExpired == false).FirstOrDefaultAsync();

						return item;

				}

		}
}
