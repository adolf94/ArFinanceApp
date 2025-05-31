using FinanceFunction.Data;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Controllers;

public class HookReferenceController
{
    private readonly ILogger<HookReferenceController> _logger;
		private readonly IHookReferenceRepo _repo;
		private readonly CurrentUser _user;

		public HookReferenceController(ILogger<HookReferenceController> logger, IHookReferenceRepo repo,
				CurrentUser user)
    {
        _logger = logger;
        _repo = repo;
				_user = user;
    }

    [Function("GetHookReferences")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "hookReference")] HttpRequest req)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();


				var ReferenceName = req.Query.FirstOrDefault(e => e.Key == "ReferenceName").Value;

				var items = await _repo.GetByName(ReferenceName.ToString());


				return new OkObjectResult(items);
    }
}
public class GetHookReferenceQueryParams
{
		public string ReferenceName { get; set; } = "";
}