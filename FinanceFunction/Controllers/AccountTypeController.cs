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
public class AccountTypeController
{
		private readonly IAccountTypeRepo _repo;
		private readonly CurrentUser _user;
		private readonly string RequiredRole = "finance_user";

		public AccountTypeController(IAccountTypeRepo repo, CurrentUser user)
		{
				_repo = repo;
				_user = user;		
		}

		[Function(nameof(GetAllType))]
		public async Task<IActionResult> GetAllType([HttpTrigger(AuthorizationLevel.Anonymous, "get",Route = "accounttypes")]
				HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				var data = await _repo.GetAllType();

				return new OkObjectResult(data);
		}

		[Function(nameof(GetOneType))]
		public async Task<IActionResult> GetOneType([HttpTrigger(AuthorizationLevel.Anonymous, "get",Route = "accounttypes/{guid}")]
				HttpRequest req, Guid id)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				AccountType? accounts = _repo.GetOne(id);

				if (accounts == null) return new NotFoundResult();

				return await Task.FromResult(new OkObjectResult(accounts));
		}

		[Function("CreateType")]
		public async Task<IActionResult> CreateType([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "accounttypes")]
				HttpRequest req)
		{
				if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
				var type = await req.ReadFromJsonAsync<AccountType>();

				await _repo.Create(type!);
				return await Task.FromResult(new CreatedAtRouteResult("accounttypes/{id}", new { id = type!.Id }, type));

		}
}

