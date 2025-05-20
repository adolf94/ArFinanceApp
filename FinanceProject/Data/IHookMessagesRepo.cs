using FinanceApp.Models;

namespace FinanceApp.Data;

public interface IHookMessagesRepo
{
	public Task<IEnumerable<HookMessage>> GetHookMessagesAsync();
    public Task<HookMessage?> GetOneHook(Guid HookId);
    public Task SaveHook(HookMessage hook, bool save = true);
		public Task<IEnumerable<HookMessage>> GetHookMessagesMonthAsync(DateTime date);
		public Task<bool> DeleteHook(HookMessage HookId);


}