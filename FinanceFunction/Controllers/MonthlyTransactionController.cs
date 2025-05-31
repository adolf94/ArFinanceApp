using FinanceFunction.Data;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Controllers;

public class MonthlyTransactionController 
{
    private readonly ILogger<MonthlyTransactionController> _logger;
		private readonly IMonthlyTransactionRepo _repo;
		private readonly CurrentUser _user;

		public MonthlyTransactionController(ILogger<MonthlyTransactionController> logger,
        IMonthlyTransactionRepo repo, CurrentUser user)
    {
        _logger = logger;
        _repo = repo;
        _user = user;
    }

    [Function("GetMonthlyTransactionByKey")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "monthlytransaction/{key}")] 
        HttpRequest req, string key)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var item = await _repo.GetOne(key);
				if (item == null) return new NotFoundResult();

				return new OkObjectResult(item);
    }
}