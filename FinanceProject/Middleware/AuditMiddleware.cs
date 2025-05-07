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
				httpContext.Request.EnableBuffering();
				var _audit = httpContext.RequestServices.GetRequiredService<IAuditLogsRepo>();
				// Allows using several time the stream in ASP.Net Core
				Guid id = await _audit.AddFromRequest(req, httpContext);

				using (var responseBody = new MemoryStream())
				{
					var originalBodyStream = httpContext.Response.Body;
					httpContext.Response.Body = responseBody;

					await _next(httpContext);
					try
					{
						await _audit.UpdateStatus(httpContext, responseBody, httpContext.Response.StatusCode);
						
						httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
						await responseBody.CopyToAsync(originalBodyStream);

					}
					catch (Exception e)
					{
						Console.WriteLine(e);
						throw;
					}
				}


			}
			else
			{
				await _next(httpContext);
			}
			
			
			
		}


}