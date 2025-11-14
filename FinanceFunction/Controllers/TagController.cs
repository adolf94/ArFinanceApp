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
		public class TagController
		{
				private readonly ITagRepo _repo;
				private readonly CurrentUser _user;
				private readonly IDbHelper _db;

				public TagController(ITagRepo repo, CurrentUser user, IDbHelper db)
				{
						_repo = repo;
						_user = user;
						_db = db;
						
				}

				[Function("CreateTag")]
				public async Task<IActionResult> CreateOne([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "tags")] HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var dto = await req.ReadFromJsonAsync<Tag>();

						await _repo.CreateTag(dto!);
						await _db.SaveChangesAsync();
						return new OkObjectResult(dto);
				}

				[Function("GetTags")]
				public async Task<IActionResult> GetTags([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "tags")] HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var output = await _repo.GetAllTags();
						return new OkObjectResult(output);
				}

		}
}
