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

namespace FinanceFunction.Controllers
{
		public class BlobFileController
		{
				private readonly IBlobFileRepo _repo;
				private readonly CurrentUser _user;
				private readonly BlobClientConfig _config;
				private readonly TokenCredential? credential;
				private readonly string RequiredRole = "FINANCE_USER";
				private readonly BlobServiceClient _client;

				public BlobFileController(IBlobFileRepo repo, CurrentUser user, IHostEnvironment env, AppConfig config)
				{
						_repo = repo;
						_user = user;
						_config = config.BlobClient;

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

						if (!blobClient.Exists()) return new NotFoundResult();
						var item = await blobClient.DownloadContentAsync();



						return new FileContentResult(item.Value.Content.ToArray(), "image/jpeg");
				}
		}
}
