using FinanceFunction.Data;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Text.Json;

using System.Text;
using FinanceFunction.Models;
using System.Net.Http.Json;

namespace FinanceFunction.Controllers;

public class HookMessagesController
{
    private readonly ILogger<HookMessagesController> _logger;
		private readonly IHookMessagesRepo _repo;
		private readonly CurrentUser _user;
		private readonly AppConfig _config;

		public HookMessagesController(ILogger<HookMessagesController> logger, IHookMessagesRepo repo, CurrentUser user, AppConfig config)
    {
        _logger = logger;
        _repo = repo;
				_user = user;
				_config = config;

		}

    [Function("GetAllHookMessages")]
    public async Task<IActionResult> GetAllHookMessages([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "hookmessages")] HttpRequest req)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var items = await _repo.GetHookMessagesAsync();
				return new OkObjectResult(items);
    }

    [Function("GetHooksByMonth")]
    public async Task<IActionResult> GetHooksByMonth([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "month/{monthkey}/hookmessages")]
        HttpRequest req, DateTime monthkey)
    {
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var items = await _repo.GetHookMessagesMonthAsync(monthkey);
				return new OkObjectResult(items);
		}

		[Function("GetOneHook")]
		public async Task<IActionResult> GetOneHookMessage([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "hookmessages/{id}")]  
		HttpRequest req, Guid id)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

				var item = await _repo.GetOneHook(id);
				if (item == null) return new NotFoundResult();
				return new OkObjectResult(item);
		}



		[Function("DeleteHook")]
		public async Task<IActionResult> DeleteHook([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "hookmessages/{id}")]
				HttpRequest req, Guid id)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var item = await _repo.GetOneHook(id);
				if (item == null) return new NotFoundResult();
				await _repo.DeleteHook(item);
				return new OkObjectResult(item);
		}


		[Function("ReprocessHookMessage")]
		public async Task<IActionResult> ReprocessHookMessage([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "hookmessages/{id}/reprocess")]
				HttpRequest req, Guid id)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

				var guid = id;

				var item = await _repo.GetOneHook(guid);
				if (item == null) return new NotFoundResult();

				var httpClient = new HttpClient();
				httpClient.BaseAddress = new Uri(_config.FinanceHook.HookUrl);
				httpClient.DefaultRequestHeaders.Add("x-api-key", _config.FinanceHook.Key);


				var jsonString = JsonSerializer.Serialize(item.JsonData);
				StringContent content = new StringContent(jsonString, Encoding.UTF8, "application/json");
				var response = await httpClient.PostAsync("/phone_hook", content);
				HookHookReprocess? body = new();
				response.EnsureSuccessStatusCode();
				body = await response.Content.ReadFromJsonAsync<HookHookReprocess>(new JsonSerializerOptions
				{
						PropertyNameCaseInsensitive = false,
						AllowTrailingCommas = true,
						DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
						ReadCommentHandling = JsonCommentHandling.Skip // Skip comments in JSON
																													 // Enables case-insensitive matching
				});

				await _repo.DeleteHook(item);
				var newItem = await _repo.GetOneHook(Guid.Parse(body!.Id));
				return new CreatedAtRouteResult("hookmessages/{id}/", new { id = body.Id! }, newItem);

		}
		public class HookHookReprocess
		{
				public string Id { get; set; }
		};


}