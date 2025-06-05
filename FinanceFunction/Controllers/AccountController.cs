using AutoMapper;
using FinanceFunction.Data;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Controllers;

public class AccountController
{
    private readonly ILogger<AccountController> _logger;
		private readonly IAccountRepo _repo;
		private readonly IMapper _mapper;
		private readonly CurrentUser _user;
    private readonly string RequiredRole = "FINANCE_USER";

		public AccountController(ILogger<AccountController> logger, IAccountRepo repo, IMapper mapper, CurrentUser user)
    {
        _logger = logger;
        _repo = repo;
        _mapper = mapper;
        _user = user;
    }

    [Function(nameof(GetAllAcount))]
    public async Task<IActionResult> GetAllAcount([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accounts")] HttpRequest req)
    {
        if (!_user.IsAuthenticated) return new UnauthorizedResult();
        if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
        var account = _repo.GetAccounts(false);
        return await Task.FromResult(new OkObjectResult(account));
    }

    [Function(nameof(GetOneAccount))]
    public async Task<IActionResult> GetOneAccount(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accounts/{id}")] HttpRequest req,
            Guid id)
		{
        if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				Account? accounts = _repo.GetOne(id);
				if (accounts == null) return new NotFoundResult();
        return await Task.FromResult(new OkObjectResult(accounts));
		}



		[Function(nameof(CreateAccount))]
    public async Task<IActionResult> CreateAccount(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "accounts")] HttpRequest req        )
		{
        if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				var type = await req.ReadFromJsonAsync<AccountCreateDto>();

        var acct = _mapper.Map<Account>(type);

        var exist = await _repo.GetAccountFromName(type!.AccountGroupId!.Value, type!.Name!);
        if (exist != null) return new ConflictObjectResult(exist);
        _repo.Create(acct);

        return new CreatedResult("api/accounts/" +acct.Id,  acct);

		}
}