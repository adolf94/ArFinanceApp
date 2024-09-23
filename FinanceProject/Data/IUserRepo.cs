using FinanceProject.Models;

namespace FinanceApp.Data
{
		public interface IUserRepo
		{
				public Task<User?> GetByEmailAsync(string email);
				public Task<User?> GetById(string guid);
				public Task<User> CreateUser(User user);
		}
}
