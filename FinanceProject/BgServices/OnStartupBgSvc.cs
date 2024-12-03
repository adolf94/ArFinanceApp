
using FinanceProject.Data;
using FinanceProject.Models;
using FinanceProject.Utilities;
using Microsoft.Extensions.Caching.Memory;
#pragma warning disable CS4014 // Because this call is not awaited, execution of the current method continues before the call is completed

namespace FinanceApp.BgServices
{
		public class OnStartupBgSvc : IHostedService
		{
				private readonly IServiceProvider _services;
				private PersistentConfig _pConfig;
				private UrlReminderConfig _urlReminder;
				private readonly IMemoryCache _cache;
				private readonly AppConfig _config;

				public OnStartupBgSvc(IServiceProvider services, AppConfig config, PersistentConfig pConfig, UrlReminderConfig urlReminderConfig, IMemoryCache cache)
				{
						_services = services;
						_pConfig = pConfig;
						_urlReminder = urlReminderConfig;
						_cache = cache;
						_config = config;
				}

				public  Task StartAsync(CancellationToken cancellationToken)
				{

					var passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;

					//Ensure ClientSecret 
					_cache.Set("gclientsecret", AesOperation.DecryptString(passkey, _config.authConfig.client_secret));

					GetLastTransaction(cancellationToken);

					return Task.CompletedTask;

				}

				private async Task GetLastTransaction(CancellationToken cancellationToken )
				{					
					var scope = _services.CreateScope();
					EnsureUrlConfig(scope);
					ITransactionRepo repo = scope.ServiceProvider.GetRequiredService<ITransactionRepo>();

					//Writing to disk instead of sql query every run
					string scheduleFolder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
					string schedTaskFile = Path.Combine(scheduleFolder, "scheduled.json");
					if (!Directory.Exists(scheduleFolder)) Directory.CreateDirectory(scheduleFolder);
					if (!File.Exists(schedTaskFile))
					{
						Transaction? tr = repo.GetLastTransactionByAdded();



						PersistentConfig conf = new PersistentConfig
						{
							LastTransactionId = tr == null ? "" : tr.Id.ToString(),
							NextScheduledTransactionDate = new DateTime(2023, 01, 01)
						};

						string newConfig = System.Text.Json.JsonSerializer.Serialize(conf);
						File.WriteAllText(schedTaskFile, newConfig);
					}

					string configString = await File.ReadAllTextAsync(schedTaskFile, cancellationToken);
					PersistentConfig confi = System.Text.Json.JsonSerializer.Deserialize<PersistentConfig>(configString)!;

					_pConfig.LastTransactionId = confi.LastTransactionId;
					_pConfig.NextScheduledTransactionDate = confi.NextScheduledTransactionDate;
					_pConfig.NextScheduledTransactionDate = confi.NextScheduledTransactionDate;
					return;
				}


				private void EnsureUrlConfig(IServiceScope scope)
				{
					
					string folder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
					string file = Path.Combine(folder, "urlReminders.json");
					
					
					if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
					if (!File.Exists(file))
					{
						string data = System.Text.Json.JsonSerializer.Serialize(new
						{
							Data = new {}
						});
						File.WriteAllText(file, data);
					}
					string configString = File.ReadAllText(file);
					UrlReminderConfig config = System.Text.Json.JsonSerializer.Deserialize<UrlReminderConfig>(configString)!;
					_urlReminder.Data = config.Data;
				}

				public Task StopAsync(CancellationToken cancellationToken)
				{

						return Task.CompletedTask;
				}
		}
}
