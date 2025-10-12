using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.Azure.Cosmos.Linq;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Middlewares
{
		internal class AppMiddleware : IFunctionsWorkerMiddleware
		{
				private AppConfig _config;

				public AppMiddleware(AppConfig config)
				{
						_config = config;
				}
				public Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
				{
						var httpContext = context.GetHttpContext();
						if (httpContext != null && httpContext.Request.Headers.ContainsKey("Authorization"))
						{
								var _user = httpContext.RequestServices.GetService<CurrentUser>();
								var jwt = _config.jwtConfig;
								var authorization = httpContext.Request.Headers.Authorization;
								var bearer = authorization.ToString().Substring(7);
								ClaimsPrincipal? principal = JwtTokenHelper.ReadClaimsFromJwt(bearer, jwt.secret_key, jwt.issuer, jwt.audience);
								if (principal != null)
								{
										httpContext.User = principal;
										_user.EmailAddress = principal.FindFirstValue(ClaimTypes.Email)!;
										_user.IsAuthenticated = true;
										_user.Roles = principal.Claims.Where(e => e.Type == ClaimTypes.Role).Select(e=>e.Value).ToArray();
										_user.App = principal.Claims.FirstOrDefault(e => e.Type == "app")?.Value ?? "";
								}
						}



						return next(context); 
				}
		}
}
