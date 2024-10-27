using FinanceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.CosmosRepo
{
		public class MemberProfileRepo : IMemberProfileRepo
		{
				private readonly AppDbContext _context;

				public MemberProfileRepo(AppDbContext context)
				{
						_context = context;
				}


				public async Task<IEnumerable<MemberProfile>> GetMemberProfiles(string app, int year)
				{
						return await _context.MemberProfiles!.Where(e => e.AppId == app && e.Year == year).ToArrayAsync();
				}

				public async Task<CoopOption> CreateCoopOption(CoopOption option)
				{
						_context.CoopOptions!.Add(option);
						await _context.SaveChangesAsync();
						return option;
				}

				public async Task<CoopOption> UpdateCoopOption(CoopOption option)
				{
						_context.Entry(option).State = EntityState.Modified;
						await _context.SaveChangesAsync();
						return option;
				}

				public async Task<MemberProfile?> GetMemberProfiles(string app, int year, Guid userId)
				{
						return await _context.MemberProfiles!.Where(e => e.AppId == app && e.Year == year && e.UserId == userId).FirstOrDefaultAsync();
				}


				public async Task<MemberProfile?> PostProfile(MemberProfile profile)
				{
						_context.MemberProfiles!.Add(profile);
						await _context.SaveChangesAsync();
						return profile;
				}




				public async Task<CoopOption?> GetCoopOptions(string app, int year)
				{
						return await _context.CoopOptions!.Where(e => e.AppId == app && e.Year == year).FirstOrDefaultAsync();
				}
		}
}
