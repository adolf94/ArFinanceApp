using FinanceFunction.Dtos;
using FinanceFunction.Models;

namespace FinanceFunction.Data
{
    public interface IHookReferenceRepo
    {
        public Task<IEnumerable<HookReference>> GetByName(string name);

        public Task<HookReference> RecordReference(HookRefLogDto dto);

    }
}
