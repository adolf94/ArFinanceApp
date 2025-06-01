using FinanceFunction.Data;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace FinanceFunction.Controllers;

public class AccountGroupController
{
    private readonly ILogger<AccountGroupController> _logger;
		private readonly IAccountGroupRepo _repo;
		private readonly CurrentUser _user;
		private readonly string RequiredRole = "finance_user";
		public AccountGroupController(ILogger<AccountGroupController> logger, IAccountGroupRepo repo, CurrentUser user)
    {
        _logger = logger;
        _repo = repo;   
				_user = user;
    }

    [Function("GetAllAccountGroups")]
    public async Task<IActionResult> GetAllAccountGroups([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accountgroups")]
        HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				IEnumerable<AccountGroup> accounts = _repo.GetAccounts();
				return await Task.FromResult(new OkObjectResult(accounts));
    }

    [Function("GetAccountGroupByType")]
    public async Task<IActionResult> GetAccountGroupByType([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accounttypes/{id}/accountgroups")]
    HttpRequest req, Guid guid)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				ICollection<AccountGroup> accounts = _repo.GetByType(guid);
				return await Task.FromResult(new OkObjectResult(accounts));
		}

		[Function("GetAccountGroupById")]
		public async Task<IActionResult> GetAccountGroupById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accounttypes/{id}")]
    HttpRequest req, Guid id)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				AccountGroup? accounts = _repo.GetOne(id);
				if (accounts == null) return new NotFoundResult();
				return await Task.FromResult(new OkObjectResult(accounts));
		}


		[Function("CreateGroup")]
		public async Task<IActionResult> CreateOne([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "accountgroups")]
				HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				var type = await req.ReadFromJsonAsync<AccountGroup>();
				_repo.Create(type!);
				return await Task.FromResult(new CreatedResult("api/accountgroups/" + type!.Id , type));

		}

}