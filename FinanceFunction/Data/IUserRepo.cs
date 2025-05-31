using FinanceFunction.Models;

namespace FinanceFunction.Data
{
		public interface IUserRepo
		{
				public Task<User?> GetByEmailAsync(string email);
				public Task<User?> GetByMobile(string mobile);
				public Task<User?> GetById(Guid guid);
				public Task<DateTime> GetLastUrlReminder(Guid guid, string appId);
				public Task SetLastUrlReminder(Guid guid, string appId, DateTime lastReminder);

				public Task<User> CreateUser(User user);
				public Task<User> UpdateUser(User user);
				public Task<User[]> GetAll();

		}
}
