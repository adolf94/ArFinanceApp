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

namespace FinanceFunction.Controllers
{
		public class BlobFileController
		{
				private readonly IBlobFileRepo _repo;
				private readonly CurrentUser _user;
				private readonly BlobClientConfig _config;
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
						_config = config.BlobClient;
						_db = db;
						_hook = hook; 

						bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
						if (string.IsNullOrEmpty(_config.ConnectionString))
						{
								// Managed identity token credential discovered when running in Azure environments
								credential = new ManagedIdentityCredential();
								_client = new BlobServiceClient(new Uri(_config.Endpoint), credential);
						}
						else
						{
								// Running locally on dev machine - DO NOT use in production or outside of local dev
								_client = new BlobServiceClient(_config.ConnectionString);
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

				[Function("GetOneFile")]
				public async Task<IActionResult> GetOneFile([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "file/{id}")] HttpRequest req,
						Guid id)
				{

						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized(RequiredRole)) return new ForbidResult();

						var file = await _repo.GetOneFileinfo(id);

						if (file == null) return new NotFoundResult();



						BlobClient blobClient = _client
								.GetBlobContainerClient(_config.Container)
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
								.GetBlobContainerClient(_config.Container)
								.GetBlobClient(file.FileKey);

						await blobClient.DeleteIfExistsAsync();

						await _repo.DeleteRecord(file);
						await _db.SaveChangesAsync();


						return new AcceptedResult();

				}
		}
}
