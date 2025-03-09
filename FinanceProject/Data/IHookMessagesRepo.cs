using FinanceApp.Models;

namespace FinanceApp.Data;

public interface IHookMessagesRepo
{
	public Task<IEnumerable<HookMessage>> GetHookMessagesAsync();

}