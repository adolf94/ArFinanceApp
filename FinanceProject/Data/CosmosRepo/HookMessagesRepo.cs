using FinanceApp.Models;
using FinanceProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;
using System.Net;

namespace FinanceApp.Data.CosmosRepo;

public class HookMessagesRepo : IHookMessagesRepo
{
	private readonly AppDbContext _context;
		private readonly AppConfig _config;

		public HookMessagesRepo(AppDbContext context, AppConfig config)
	{
		_context = context;
				_config = config;
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
				await Task.CompletedTask;
		}
		public async Task<bool> DeleteHook(HookMessage hook)
		{
				_context.Entry(hook).State = EntityState.Deleted;
				await _context.SaveChangesAsync();

				string constr = _context.Database.GetDbConnection().ConnectionString;
				CosmosClient client = new CosmosClient(constr);

				Database db = client.GetDatabase(_config.PersistDb);

				Container container =  db.GetContainer("HookMessages");

				await container.DeleteItemAsync<HookMessage>(hook.Id.ToString(), new PartitionKey("default"), null);

				return true;
		}

}