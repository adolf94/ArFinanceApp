using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
    public class HookReferenceRepo : IHookReferenceRepo
    {
        private AppDbContext _context;

        public HookReferenceRepo(AppDbContext context)
        {
            _context = context;    
        }



        public async Task<IEnumerable<HookReference>> GetByName(string name)
        {

            return await _context.HookReferences.Where(e => e.ReferenceName == name)
                .ToArrayAsync();

        }

    }
}
