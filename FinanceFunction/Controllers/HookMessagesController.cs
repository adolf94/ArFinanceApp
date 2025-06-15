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
using Microsoft.EntityFrameworkCore;
using FinanceFunction.Data.CosmosRepo;
using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;

namespace FinanceFunction.Controllers;

public class HookMessagesController
{
    private readonly ILogger<HookMessagesController> _logger;
		private readonly IHookMessagesRepo _repo;
		private readonly CurrentUser _user;
		private readonly IDbHelper _db;
		private readonly AppConfig _config;
		private readonly IBlobFileRepo _files;

		public HookMessagesController(ILogger<HookMessagesController> logger, IHookMessagesRepo repo, CurrentUser user, 
				AppConfig config, IDbHelper db, IBlobFileRepo blob)
    {
        _logger = logger;
        _repo = repo;
				_user = user;
				_db = db;
				_config = config;
				_files = blob;

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


		[Function("GetOneHookWithKey")]
		public async Task<IActionResult> GetOneHookWithKey([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "month/{month}/hookmessages/{id}")]
		HttpRequest req, Guid id, string month)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

				var item = await _repo.GetOneHookWithMonth(id,month );
				if (item == null) return new NotFoundResult();
				return new OkObjectResult(item);
		}



		[Function("DeleteHook")]
		public async Task<IActionResult> DeleteHook([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "month/{month}/hookmessages/{id}")]
				HttpRequest req, Guid id, string month)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
				var item = await _repo.GetOneHookWithMonth(id, month);
				if (item == null) return new NotFoundResult();
				await _repo.DeleteHook(item);
				return new OkObjectResult(item);
		}


		[Function("DeleteManyHook")]
		public async Task<IActionResult> DeleteHookMany([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "month/{month}/hookmessages")]
				HttpRequest req, DateTime month)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();
				if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

				var body = await req.ReadFromJsonAsync<IEnumerable<string>>();


				var items = await _repo.GetHookMessagesMonthAsync(month);
				var toDelete = items.Where(e => body!.Contains(e.Id.ToString()))
						.ToList();


				BlobContainerClient? blobSvc = null;

				for (var i = 0; i < toDelete.Count(); i++)
				{
						var item = toDelete[i];
						await _repo.DeleteHook(item);
						if (!string.IsNullOrEmpty(item.JsonData?.imageId))
						{
								BlobFile? file = await _files.GetOneFileinfo(Guid.Parse(item.JsonData!.imageId));
								if (blobSvc is null)
								{
										if (string.IsNullOrEmpty(_config.BlobClient.ConnectionString))
										{
												// Managed identity token credential discovered when running in Azure environments
												var creds = new ManagedIdentityCredential();
												var client = new BlobServiceClient(new Uri(_config.BlobClient.Endpoint), creds);
												blobSvc = client.GetBlobContainerClient(_config.BlobClient.Container);
										}
										else
										{
												// Running locally on dev machine - DO NOT use in production or outside of local dev
												var client = new BlobServiceClient(_config.BlobClient.ConnectionString);
												blobSvc = client.GetBlobContainerClient(_config.BlobClient.Container);
										}
								}
								if (file != null) await blobSvc.DeleteBlobIfExistsAsync(file.FileKey);
						}
				}
				await _db.SaveChangesAsync();

				return new OkObjectResult(toDelete.Select(e=>e.Id).ToArray());
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
				return new CreatedResult("api/hookmessages/" + body.Id!, newItem);

		}
		public class HookHookReprocess
		{
				public string Id { get; set; }
		};


}