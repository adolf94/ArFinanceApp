
using FinanceApp.Data;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;

namespace FinanceApp.BgServices
{
		public class ComputeInterestBg : IHostedService
		{
				private readonly IServiceProvider _services;
				private PersistentConfig _pConfig;
				private readonly AppConfig _config;

				public ComputeInterestBg(IServiceProvider services, PersistentConfig pConfig, AppConfig config)
				{
						_services = services;
						_pConfig = pConfig;
						_config = config;
				}

				public async Task StartAsync(CancellationToken cancellationToken)
				{

						var scope = _services.CreateScope();

						ILoanRepo repo = scope.ServiceProvider.GetRequiredService<ILoanRepo>();
						IUserRepo _user = scope.ServiceProvider.GetRequiredService<IUserRepo>();
						Sms sms = scope.ServiceProvider.GetRequiredService<Sms>();

						//Writing to disk instead of sql query every run
						string SchedFolder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
						string SchedTaskFile = Path.Combine(SchedFolder, "scheduled.json");

						IEnumerable<Loan> items = await repo.GetPendingInterests();

						var enumerable = items as Loan[] ?? items.ToArray();
						if (enumerable.Any())
						{

								for (int i = 0; i < enumerable.Count(); i++)
								{
										Loan item = enumerable.ToList()[i];

										User? user = await _user.GetById(item.UserId);
										var result = await repo.ComputeInterests(item, DateTime.Now);

										if (!string.IsNullOrEmpty(user!.MobileNumber) && result.InterestData.Amount > 0)
										{
												await sms.SendSms($"Interest worth {result.InterestData.Amount} was added to your loan dated {item.Date.ToString("MMM-dd")}."
														//$"for period {result.NewLoanData.LastInterestDate.ToString("MMM-d")} - {result.NewLoanData.NextInterestDate.ToString("MMM-d")}. \n"
														, user!.MobileNumber, true);

												if (await _user.GetLastUrlReminder(item.UserId, item.AppId) <
												    DateTime.Now.AddDays(-3))
												{
													
													//get basePath from appconfig
													AppConfig.Application? app = _config.Apps.FirstOrDefault(e => e.App == item.AppId);
													if (app == null) return;
													await sms.SendSms($"View outstanding loans at {app.RedirectUri}."
														, user!.MobileNumber);
												}
												
										}
								}

						}
						await Task.CompletedTask;
				}
				public Task StopAsync(CancellationToken cancellationToken)
				{

						return Task.CompletedTask;
				}
		}
}
