using FinanceFunction.Data;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Controllers
{
		public class TransactionGroupController
		{
				private readonly ITransactionGroupRepo _repo;
				private readonly IDbHelper _db;
				private readonly CurrentUser _user;

				public TransactionGroupController(ITransactionGroupRepo repo, IDbHelper db, CurrentUser user)
				{
						_repo = repo;
						_db = db;
						_user = user;
				}


				[Function("CreateOneTransactionGroup")]
				public async Task<IActionResult> CreateOneTransactionGroup([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transactiongroups")]
				HttpRequest req)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();


						var dto = await req.ReadFromJsonAsync<TransactionGroup>();
						var item = await _repo.CreateTransactionGroup(dto);

						await _db.SaveChangesAsync();
						return new OkObjectResult(item);

				}

				[Function("GetTransactionGroup")]
				public async Task<IActionResult> GetOneTransactionGroup([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "transactiongroups/{id}")]
				HttpRequest req, Guid id)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var item = await _repo.GetOneGroup(id);

						return new OkObjectResult(item);
				}
		}
}
