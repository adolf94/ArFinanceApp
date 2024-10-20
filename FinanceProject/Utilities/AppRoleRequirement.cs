using Microsoft.AspNetCore.Authorization;

namespace FinanceApp.Utilities
{
		public class AppRoleRequirement : IAuthorizationRequirement
		{
				public string Role { get; }

				public AppRoleRequirement(string role)
				{
						Role = role;
				}
		}
}
