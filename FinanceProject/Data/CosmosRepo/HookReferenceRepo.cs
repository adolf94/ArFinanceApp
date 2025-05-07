using FinanceApp.Dto;
using FinanceApp.Models;
using Microsoft.AspNetCore.Routing.Constraints;
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
        public async Task<HookReference> RecordReference(HookRefLogDto dto)
        {
            List<HookReference> logs = await _context.HookReferences.Where(e => 
                e.ReferenceName == dto.ReferenceName
                && e.Type == dto.Type
                ).ToListAsync();


            var toEdit = logs.Where(e =>
            {
                return e.AccountId == dto.AccountId && e.VendorId == dto.VendorId;
            }).FirstOrDefault();

            List<HookReference> toUpdate = new List<HookReference>();

            if (toEdit == null)
            {
                toEdit = new HookReference
                {
                    Id = Guid.CreateVersion7(),
                    ReferenceName = dto.ReferenceName,
                    Type = dto.Type,
                    AccountId = dto.AccountId,
                    VendorId = dto.VendorId,
                    Hits = 0
                };
                _context.HookReferences.Add(toEdit);
                toUpdate.Add(toEdit);
            }
            toUpdate.Add(toEdit);

            if (toEdit.ConfigHits.ContainsKey(dto.SubConfig))
            {
                toEdit.ConfigHits[dto.SubConfig]++;
            }
            else
            {
                toEdit.ConfigHits[dto.SubConfig] = 1;
            }


            if (dto.VendorId == null)
            {
                logs.Where(e => e.AccountId == dto.AccountId).ToList().ForEach(e =>
                {
                   toUpdate.Add(e);
                });
            }
            if (dto.AccountId == null)
            {
                logs.Where(e => e.VendorId == dto.VendorId).ToList().ForEach(e =>
                {
                    toUpdate.Add(e);
                });
            }

            toUpdate.ForEach(e =>
            {
                e.Hits++;
            });

            await _context.SaveChangesAsync();
            return toEdit; 

        }

    }
}
