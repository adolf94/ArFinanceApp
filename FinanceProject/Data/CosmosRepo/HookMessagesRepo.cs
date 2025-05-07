using FinanceApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo;

public class HookMessagesRepo : IHookMessagesRepo
{
	private readonly AppDbContext _context;

	public HookMessagesRepo(AppDbContext context)
	{
		_context = context;
    }

    public async Task<IEnumerable<HookMessage>> GetHookMessagesAsync()
    {
        return await _context.HookMessages!.ToArrayAsync();
    }



    public async Task<HookMessage?> GetOneHook(Guid HookId)
    {
        return await _context.HookMessages!.Where(e=>e.Id == HookId).FirstOrDefaultAsync();
    }

}