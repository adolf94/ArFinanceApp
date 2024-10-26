using Microsoft.Identity.Web;
using System.Security.Claims;

namespace FinanceApp.Utilities
{
		public static class ClaimsPrincipalExtension
		{
				public static bool IsInAppRole(this ClaimsPrincipal user, string RoleName)
				{
						string App = user.FindFirstValue("app")!;

						return user.Claims.Any(e => e.Type == ClaimConstants.Role
								&& (e.Value.ToUpper() == RoleName || (!string.IsNullOrEmpty(App) && e.Value.ToUpper() == $"{App.ToUpper()}_{RoleName}")));
				}
		}
}
