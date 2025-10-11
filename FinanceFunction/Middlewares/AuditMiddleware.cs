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
						var _audit = httpContext!.RequestServices.GetService<IAuditLogRepo>();
						var _logger = httpContext!.RequestServices.GetService<ILogger<AuditMiddleware>>();
						await _audit!.UpdateStatus(httpContext.Response.StatusCode, null);


						//if((new[] {"POST","PUT","PATCH" }).Contains(httpContext.Request.Method))
						//{
						//		var responseBody = new MemoryStream();
						//		var originalBodyStream = httpContext.Response.Body;
						//		httpContext.Response.Body = responseBody;

						//		await next(context);
						//		try
						//		{
						//				await httpContext.Response.CompleteAsync();


						//				var body = context.GetHttpResponseData();
						//				await _audit!.UpdateStatus(httpContext.Response.StatusCode, body.Body);

						//				httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
						//				await responseBody.CopyToAsync(originalBodyStream);

						//		}
						//		catch (Exception e)
						//		{
						//				_logger!.LogError(e.Message); httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
						//				await responseBody.CopyToAsync(originalBodyStream);
						//				httpContext.Response.Body.Seek(0, SeekOrigin.Begin);
						//				await responseBody.CopyToAsync(originalBodyStream);
						//				throw;
						//		}
						//		finally
						//		{
						//				httpContext.Response.Body = originalBodyStream;
						//				responseBody.Dispose();
						//		}

						//}
						//else
						//{

						//}



				}
		}
}
