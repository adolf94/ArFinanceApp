using FinanceApp.Models;

namespace FinanceApp.Data;

public interface IHookMessagesRepo
{
	public Task<IEnumerable<HookMessage>> GetHookMessagesAsync();
    public Task<HookMessage?> GetOneHook(Guid HookId);
    public Task SaveHook(HookMessage hook, bool save = true);


}