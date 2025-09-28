using FinanceFunction.Data;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Controllers
{
		public class ScheduledTransactionController
		{
				private readonly IScheduledTransactionRepo _repo;
				private readonly CurrentUser _user;
				private readonly IDbHelper _db;

				public ScheduledTransactionController(IScheduledTransactionRepo repo, CurrentUser user, IDbHelper db)
				{
						_repo = repo;
						_user = user;
						_db = db;
				}

				[Function("CreateScheduledTransaction")]
				public async Task<IActionResult> CreateScheduledTransaction([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "scheduledtransactions")] HttpRequest req)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var item = await req.ReadFromJsonAsync<ScheduledTransactions>();
						if(item == null) return new BadRequestResult();

						await _repo.CreateSchedule(item);
						await _db.SaveChangesAsync();

						//return new CreatedAtRouteResult("routeName" = nameof(GetOne), routeValues = new { guid = item.Id }, value = item);
						return new ObjectResult(item)
						{
								StatusCode = StatusCodes.Status201Created
						};

				}

				public async Task<IActionResult> GetOne([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "scheduledtransactions/{guid}")] HttpRequest req, Guid guid)
				{
						ScheduledTransactions? schedule = await _repo.GetOne(guid);
						if (schedule == null) return new NotFoundResult();

						return new OkObjectResult(schedule);
				}
				public async Task<IActionResult> GetAll([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "scheduledtransactions")] HttpRequest req)
				{

						var result = await _repo.GetAll();
						return new OkObjectResult(result);
				}
		}
}
