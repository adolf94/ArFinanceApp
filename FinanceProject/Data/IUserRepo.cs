using FinanceProject.Models;

namespace FinanceApp.Data
{
		public interface IUserRepo
		{
				public Task<User?> GetByEmailAsync(string email);
				public Task<User?> GetByMobile(string mobile);
				public Task<User?> GetById(Guid guid);
				public Task<User> CreateUser(User user);
				public Task<User> UpdateUser(User user);
				public Task<User[]> GetAll();

		}
}
