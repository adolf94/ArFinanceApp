using FinanceFunction.Data;
using FinanceFunction.Dtos;
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

				if (!req.Query.Any(e => e.Key == "referenceName")) return new BadRequestResult();

				var ReferenceName = req.Query["referenceName"]!;

				var items = await _repo.GetByName(ReferenceName);


				return new OkObjectResult(items);
    }


		[Function("LogHookReference")]
    public async Task<IActionResult> LogHookReference([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "hookReference")] HttpRequest req)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var dto = await req.ReadFromJsonAsync<HookRefLogDto>();

				var items = await _repo.RecordReference(dto!);


				return new OkObjectResult(items);

		}

}
public class GetHookReferenceQueryParams
{
		public string ReferenceName { get; set; } = "";
}