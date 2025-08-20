using AutoMapper;
using FinanceFunction.Data;
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
		public class HookConfigController
		{
				private readonly IHookConfigRepo _repo;
				private readonly IMapper _mapper;
				private readonly CurrentUser _user;
				private readonly IDbHelper _db;

				public HookConfigController(IHookConfigRepo repo, CurrentUser user, IDbHelper db, IMapper mapper)
				{
						_repo = repo;
						_mapper = mapper;
						_user = user;
						_db = db;
				}


				[Function("CreateOneHookConfig")]
				public async Task<IActionResult> CreateOneHookConfig([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "hookconfig")] HttpRequest req)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
						var dto = await req.ReadFromJsonAsync<HookConfig>();

						await _repo.Create(dto!);
						await _db.SaveChangesAsync();
						return new OkObjectResult(dto);
				}


				[Function("UpdateOneConfig")]
				public async Task<IActionResult> UpdateOneConfig([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "hookconfig/{nameKey}")] HttpRequest req, string nameKey)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var dto = await req.ReadFromJsonAsync<HookConfig>();
						if (dto!.NameKey != nameKey) return new BadRequestResult();

						var item = await _repo.GetOneByName(dto.NameKey, dto.Type);

						_mapper.Map(dto, item);

						await _db.SetUpdated(item);
						await _db.SaveChangesAsync();
						return new NoContentResult();
				}

				[Function("GetOneConfig")]
				public async Task<IActionResult> GetOneConfig([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "types/{type}/hookconfig/{nameKey}")] HttpRequest req, string nameKey, string type)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();


						var item = await _repo.GetOneByName(nameKey, type);

						if (item == null) return new NotFoundResult();
						return new OkObjectResult(item);
				}


				[Function("GetConfigByType")]
				public async Task<IActionResult> GetConfigByType([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "types/{type}/hookconfigs")] HttpRequest req,
						string type)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						var data = await _repo.GetConfigByType(type);

						return new OkObjectResult(data);
				}

		}
}
