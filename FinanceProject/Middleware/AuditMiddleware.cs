using System.Security.Claims;
using System.Text;
using FinanceApp.Data;
using FinanceApp.Data.CosmosRepo;
using Newtonsoft.Json.Linq;

namespace FinanceApp.Middleware;

public class AuditMiddleware
{
	
		private readonly RequestDelegate _next;

		public AuditMiddleware( RequestDelegate next)
		{
			_next = next;
		}

		public async Task Invoke(HttpContext httpContext)
		{
			var req = httpContext.Request;


			if (new[] { "POST", "PUT", "DELETE" }.Contains(httpContext.Request.Method) )
			{
				
				var _audit = httpContext.RequestServices.GetRequiredService<IAuditLogsRepo>();
				// Allows using several time the stream in ASP.Net Core
				Guid id = await _audit.AddFromRequest(req, httpContext);
				await _next(httpContext);

				await _audit.UpdateStatus(httpContext, httpContext.Response.StatusCode);

			}
			else
			{
				await _next(httpContext);
			}
			
			
			
		}


}