
using FinanceProject.Data;
using FinanceProject.Models;

namespace FinanceApp.BgServices
{
		public class OnStartupBgSvc : IHostedService
		{
				private readonly IServiceProvider _services;
				private PersistentConfig _pConfig;
				private UrlReminderConfig _urlReminder;

				public OnStartupBgSvc(IServiceProvider services, PersistentConfig pConfig, UrlReminderConfig urlReminderConfig)
				{
						_services = services;
						_pConfig = pConfig;
						_urlReminder = urlReminderConfig;
				}

				public Task StartAsync(CancellationToken cancellationToken)
				{

						var scope = _services.CreateScope();
						EnsureUrlConfig(scope);
						ITransactionRepo repo = scope.ServiceProvider.GetRequiredService<ITransactionRepo>();

						//Writing to disk instead of sql query every run
						string SchedFolder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
						string SchedTaskFile = Path.Combine(SchedFolder, "scheduled.json");
						if (!Directory.Exists(SchedFolder)) Directory.CreateDirectory(SchedFolder);
						if (!File.Exists(SchedTaskFile))
						{
								Transaction? tr = repo.GetLastTransactionByAdded();



								PersistentConfig conf = new PersistentConfig
								{
										LastTransactionId = tr == null ? "" : tr.Id.ToString(),
										NextScheduledTransactionDate = new DateTime(2023, 01, 01)
								};

								string newConfig = System.Text.Json.JsonSerializer.Serialize(conf);
								File.WriteAllText(SchedTaskFile, newConfig);
						}

						string configString = File.ReadAllText(SchedTaskFile);
						PersistentConfig confi = System.Text.Json.JsonSerializer.Deserialize<PersistentConfig>(configString)!;

						_pConfig.LastTransactionId = confi.LastTransactionId;
						_pConfig.NextScheduledTransactionDate = confi.NextScheduledTransactionDate;
						_pConfig.NextScheduledTransactionDate = confi.NextScheduledTransactionDate;

						return Task.CompletedTask;

				}


				private void EnsureUrlConfig(IServiceScope scope)
				{
					string Folder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
					string file = Path.Combine(Folder, "urlReminders.json");
					
					
					if (!Directory.Exists(Folder)) Directory.CreateDirectory(Folder);
					if (!File.Exists(file))
					{
						string data = System.Text.Json.JsonSerializer.Serialize(new
						{
							Data = new {}
						});
						File.WriteAllText(file, data);
					}
					string configString = File.ReadAllText(file);
					UrlReminderConfig confi = System.Text.Json.JsonSerializer.Deserialize<UrlReminderConfig>(configString)!;
					_urlReminder.Data = confi.Data;
				}

				public Task StopAsync(CancellationToken cancellationToken)
				{

						return Task.CompletedTask;
				}
		}
}
