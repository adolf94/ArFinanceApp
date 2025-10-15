using FinanceFunction.Data;
using FinanceFunction.Utilities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker.Middleware;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace FinanceFunction.Middlewares
{
		public class AuditMiddleware : IFunctionsWorkerMiddleware
		{

				public async Task Invoke(FunctionContext context, FunctionExecutionDelegate next)
				{
						var httpContext = context.GetHttpContext();
						await next(context);
						if(httpContext != null)
						{
								var _audit = httpContext!.RequestServices.GetService<IAuditLogRepo>();
								var _logger = httpContext!.RequestServices.GetService<ILogger<AuditMiddleware>>();
								await _audit!.UpdateStatus(httpContext.Response.StatusCode, item: null);
								_logger!.LogInformation("AuditMiddleware was Completed");

						}


				}
		}
}
