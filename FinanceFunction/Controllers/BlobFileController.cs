using Azure.Core;
using Azure.Identity;
using Azure.Storage.Blobs;
using Azure.Storage;
using FinanceFunction.Data;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FinanceFunction.Models;
using static FinanceFunction.Models.AppConfig;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.Http.HttpResults;
using static FinanceFunction.Models.HookMessage;
using static FinanceFunction.Controllers.HookMessagesController;
using System.Text.Json;
using System.Net.Http.Json;

namespace FinanceFunction.Controllers
{
		public class BlobFileController
		{
				private readonly IBlobFileRepo _repo;
				private readonly CurrentUser _user;
				private readonly AppConfig _config;
				private readonly IDbHelper _db;
				private readonly IHookMessagesRepo _hook;
				private readonly TokenCredential? credential;
				private readonly string RequiredRole = "FINANCE_USER";
				private readonly BlobServiceClient _client;
			

				public BlobFileController(IBlobFileRepo repo, CurrentUser user, IHostEnvironment env, 
						AppConfig config, IDbHelper db, IHookMessagesRepo hook)
				{
						_repo = repo;
						_user = user;
						_config = config;
						_db = db;
						_hook = hook; 

						bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
						if (string.IsNullOrEmpty(_config.BlobClient.ConnectionString))
						{
								// Managed identity token credential discovered when running in Azure environments
								credential = new ManagedIdentityCredential();
								_client = new BlobServiceClient(new Uri(_config.BlobClient.Endpoint), credential);
						}
						else
						{
								// Running locally on dev machine - DO NOT use in production or outside of local dev
								_client = new BlobServiceClient(_config.BlobClient.ConnectionString);
						}
				}

				[Function("GetFiles")]
				public async Task<IActionResult> GetFiles([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "files")] HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();

						var files = await _repo.GetFiles();

						return new OkObjectResult(files);

				}
				[Function("UpdateHookAiData")]
				public async Task<IActionResult> UpdateHookAidata([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route="files/{id}/aidata")]
							HttpRequest req, Guid id)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();

						var data = await req.ReadFromJsonAsync<ExtractedDataModel>();

						var file = await _repo.GetOneFileinfo(id);
						if (file == null) return new NotFoundResult();

						file.AiData = data;
						file.AiReviewed = true;
						if (file.hookId.HasValue)
						{
								var hok = await _hook.GetOneHook(file.hookId.Value);
								if(hok != null)
								{
										hok.ExtractedData = data;
										hok.TimeToLive = new HookMessage().TimeToLive;
								}
						}
						await _db.SaveChangesAsync();
						//then update the hook from HookId
						return new NoContentResult();
				}

				[Function("RegenerateAiExtraction")]
				public async Task<IActionResult> RegenerateAiExtraction([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "file/{id}/aidata")] HttpRequest req,
						Guid id)
				{
						//if (!_user.IsAuthenticated) return new UnauthorizedResult();
						//if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();

						var query = req.Query;
						var generate = req.Query.FirstOrDefault(e => e.Key == "action");
						ExtractedDataModel? body = new();

						if (generate.Value.Any())
						{


								var httpClient = new HttpClient();
								httpClient.BaseAddress = new Uri(_config.FinanceHook.HookUrl);
								httpClient.DefaultRequestHeaders.Add("x-api-key", _config.FinanceHook.Key);
								httpClient.DefaultRequestHeaders.Add("x-allow-dup", "true");


								//var jsonString = JsonSerializer.Serialize(item.JsonData);
								//StringContent content = new StringContent(jsonString, Encoding.UTF8, "application/json");
								var response = await httpClient.GetAsync($"/image_ai_hook/{id}");
								if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return new NotFoundResult();
								response.EnsureSuccessStatusCode();

						}


						var item = await _repo.GetOneFileinfo(id);
						if (item == null) return new NotFoundResult();
						body = item.AiData;

						return new OkObjectResult(body);

				}


				[Function("GetOneFile")]
				public async Task<IActionResult> GetOneFile([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "file/{id}")] HttpRequest req,
						Guid id)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();


						var file = await _repo.GetOneFileinfo(id);

						if (file == null) return new NotFoundResult();



						BlobClient blobClient = _client
								.GetBlobContainerClient(_config.BlobClient.Container)
								.GetBlobClient(file.FileKey);

						if (!blobClient.Exists().Value) return new NotFoundResult();
						var item = await blobClient.DownloadContentAsync();



						return new FileContentResult(item.Value.Content.ToArray(), "image/jpeg");
				}

				[Function("DeleteOneFile")]
				public async Task<IActionResult> DeleteOneFile([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "file/{id}")] HttpRequest req,
						Guid id)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();
						var file = await _repo.GetOneFileinfo(id);

						if (file == null) return new NotFoundResult();



						BlobClient blobClient = _client
								.GetBlobContainerClient(_config.BlobClient.Container)
								.GetBlobClient(file.FileKey);

						await blobClient.DeleteIfExistsAsync();

						await _repo.DeleteRecord(file);
						await _db.SaveChangesAsync();


						return new AcceptedResult();

				}
		}
}
