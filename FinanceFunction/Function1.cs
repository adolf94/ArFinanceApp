using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
namespace FinanceFunction
{
    public class Function1
    {
        private readonly ILogger<Function1> _logger;

        public Function1(ILogger<Function1> logger)
        {
            _logger = logger;
        }

				[Function("Function1")]
				public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequest req)
				{
						_logger.LogInformation("C# HTTP trigger function processed a request.");
						return new OkObjectResult("Welcome to Azure Functions!");
				}

				[Authorize]
				[Function("Function2")]
				public IActionResult TestLogin([HttpTrigger(AuthorizationLevel.Anonymous,  "get", Route = "Auth")] HttpRequest req)
				{
						_logger.LogInformation(req.HttpContext.User.Identity.IsAuthenticated.ToString());
						_logger.LogInformation("C# HTTP trigger function processed a request.");
						return new OkObjectResult("Welcome to Azure Functions!");
				}
		}
}
