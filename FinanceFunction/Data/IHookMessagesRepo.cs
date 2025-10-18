using FinanceFunction.Models;

namespace FinanceFunction.Data;

public interface IHookMessagesRepo
{
	public Task<IEnumerable<HookMessage>> GetHookMessagesAsync();
    public Task<HookMessage?> GetOneHook(Guid HookId);
    public Task SaveHook(HookMessage hook, bool save = true);
		public Task<IEnumerable<HookMessage>> GetHookMessagesMonthAsync(DateTime date);
		public Task<bool> DeleteHook(HookMessage HookId);
		public  Task<HookMessage?> GetOneHookWithMonth(Guid HookId, string key);
		public Task<IEnumerable<HookMessage>> GetHookByFile(string fileId);

		public Task DeleteMany(IEnumerable<HookMessage> items, string partitionKey);



}