
using FinanceProject.Data;
using FinanceProject.Models;

namespace FinanceApp.BgServices
{
		public class OnStartupBgSvc : IHostedService
		{
				private readonly IServiceProvider _services;
				private PersistentConfig _pConfig;

				public OnStartupBgSvc(IServiceProvider services, PersistentConfig pConfig)
				{
						_services = services;
						_pConfig = pConfig;
				}

				public Task StartAsync(CancellationToken cancellationToken)
				{

						var scope = _services.CreateScope();

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

						return Task.CompletedTask;

				}

				public Task StopAsync(CancellationToken cancellationToken)
				{
						throw new NotImplementedException();
				}
		}
}
