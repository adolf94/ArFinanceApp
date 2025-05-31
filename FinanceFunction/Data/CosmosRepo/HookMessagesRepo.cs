using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using System.Net;

namespace FinanceFunction.Data.CosmosRepo;

public class HookMessagesRepo : IHookMessagesRepo
{
	private readonly AppDbContext _context;
		private readonly AppConfig _config;
		private readonly IConfiguration _iconfig;
		private readonly ILogger<HookMessagesRepo> _logger;

		public HookMessagesRepo(AppDbContext context, AppConfig config, IConfiguration iconfig, ILogger<HookMessagesRepo> logger)
	{
		_context = context;
				_config = config;
				_iconfig = iconfig;
				_logger = logger;
    }

    public async Task<IEnumerable<HookMessage>> GetHookMessagesAsync()
    {
        return await _context.HookMessages!.ToArrayAsync();
    }


		public async Task<IEnumerable<HookMessage>> GetHookMessagesMonthAsync(DateTime date)
		{
        string key = date.ToString("yyyy-MM-01");
				return await _context.HookMessages!
            .Where(e=>e.MonthKey == key)
            .ToArrayAsync();
		}


		public async Task<HookMessage?> GetOneHook(Guid HookId)
    {
        return await _context.HookMessages!.Where(e=>e.Id == HookId).FirstOrDefaultAsync();
    }

		public async Task SaveHook(HookMessage hook, bool save = true)
		{
				_context.Entry(hook).State = EntityState.Modified;
				if (save) await _context.SaveChangesAsync();
				string constr = AesOperation.DecryptString(Environment.GetEnvironmentVariable("ENV_PASSKEY")!,
						_iconfig.GetConnectionString("CosmosDb")!);
				CosmosClient client = new CosmosClient(constr);

				Database db = await client.CreateDatabaseIfNotExistsAsync(_config.PersistDb);

				Container container = await db.CreateContainerIfNotExistsAsync("HookMessages", "/MonthKey");
				try
				{
						await container.UpsertItemAsync(hook);
				}catch(Exception ex)
				{
				}
				await Task.CompletedTask;
		}
		public async Task<bool> DeleteHook(HookMessage hook)
		{
				_context.Entry(hook).State = EntityState.Deleted;
				await _context.SaveChangesAsync();

				string constr = AesOperation.DecryptString(Environment.GetEnvironmentVariable("ENV_PASSKEY")!, 
						_iconfig.GetConnectionString("CosmosDb")!);
				CosmosClient client = new CosmosClient(constr);

				Database db = client.GetDatabase(_config.PersistDb);

				Container container =  db.GetContainer("HookMessages");
				try
				{
						await container.DeleteItemAsync<HookMessage>(hook.Id.ToString(), new PartitionKey("default"), null);
				}catch (Exception ex)
				{
						if (!ex.Message.Contains("NotFound"))
						{
								_logger.LogError(ex, "Error deleting the hookmsg in the persistent notification db");
						}
						
				}

				return true;
		}

}