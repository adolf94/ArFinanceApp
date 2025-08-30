using FinanceFunction.Data;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Google.Protobuf.WellKnownTypes;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos.Serialization.HybridRow;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Controllers
{
		public class AccountBalanceController
		{
				private readonly CurrentUser _user;
				private readonly IAccountBalanceRepo _repo;
				private readonly IAccountRepo _acct;

				public AccountBalanceController(IAccountBalanceRepo repo, IAccountRepo acct, CurrentUser user)
				{
						_user = user;
						_repo = repo;
						_acct = acct;
				}

				[Function("GetAccountBalanceByDate")]
				public async Task<IActionResult> GetByDate([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accountbalance/{date}")]
				HttpRequest req, DateTime date)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
						var creditParam = req.Query.Where(e=>e.Key=="credit").FirstOrDefault();
						var credit = creditParam.Value == true;

						IEnumerable<AccountBalance> result;
						if (credit == true)
						{
								result = _repo.GetByDateCredit(date);
						}
						else
						{
								result = _repo.GetByDate(date);
						}
						return await Task.FromResult(new OkObjectResult(result));
				}

				[Function("GetAcctByBalanceId")]
				public async Task<IActionResult> GetByAcctDate([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "account/{acctId}/accountbalance/{date}")]
					HttpRequest req, Guid acctId, DateTime date)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
						Account? acct = _acct.GetOne(acctId);

						if (acct == null) return new NotFoundResult();

						var result = await _repo.GetOne(acct, date);
						if (result == null) return new NotFoundResult();

						return await Task.FromResult(new OkObjectResult(result));
				}

				[Function("GetAcctByFilter")]
				public async Task<IActionResult> GetAcctByFilter([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "accountbalance")]
						HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();


						var query = await _repo.GetAll();

						if (req.Query.ContainsKey("accountId")) query = query.Where(e => e.AccountId == Guid.Parse(req.Query["accountId"].First()!));
						if (req.Query.ContainsKey("from"))
						{
								DateTime from;
								DateTime.TryParse(req.Query["from"].First(), out from);
								if (from == DateTime.MinValue)  return new BadRequestResult();
								query = query.Where(e => e.DateStart >= from);
						}
						if (req.Query.ContainsKey("to"))
						{
								DateTime to;
								DateTime.TryParse(req.Query["to"].First(), out to);
								if (to == DateTime.MinValue) return new BadRequestResult();
								query = query.Where(e => e.DateStart <= to);
						}
						var result = await query.ToArrayAsync();


						return await Task.FromResult(new OkObjectResult(result));

				}
		}
}
