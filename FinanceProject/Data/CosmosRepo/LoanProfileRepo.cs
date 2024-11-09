using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class LoanProfileRepo : ILoanProfileRepo
		{
				private readonly AppDbContext _context;

				public LoanProfileRepo(AppDbContext context) {
						_context = context;
				}


				public async Task<LoanProfile> CreateNewProfile(LoanProfile profile)
				{
						await _context.LoanProfiles!.AddAsync(profile);
						await _context.SaveChangesAsync();
						return profile;
				}
				public async Task<LoanProfile?> GetOneProfile(string appId, Guid id)
				{
						LoanProfile? profile = await _context.LoanProfiles!.Where(e => e.AppId == appId && e.ProfileId == id).FirstOrDefaultAsync();
						return profile;
				}
				public async Task<IEnumerable<LoanProfile>> GetAll(string appId)
				{
						return await _context.LoanProfiles!.Where(e => e.AppId == appId ).ToArrayAsync();
				}
		}
}
