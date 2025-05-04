using FinanceApp.Models;

namespace FinanceApp.Data
{
    public interface IHookReferenceRepo
    {
        public Task<IEnumerable<HookReference>> GetByName(string name);


    }
}
