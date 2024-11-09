using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.Identity.Web;
using System.Security.Claims;

namespace FinanceApp.Utilities
{
		public class RoleRequirementHandler : AuthorizationHandler<RolesAuthorizationRequirement>
		{

				protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RolesAuthorizationRequirement requirement)
				{

						string? App = context.User.FindFirstValue("app");
						if (requirement.AllowedRoles.Any(b => context.User.IsInAppRole(b)))
						{
								context.Succeed(requirement);
						}

						return Task.CompletedTask;
				}
		}
}
