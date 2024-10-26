using FinanceApp.Models;

namespace FinanceApp.Data
{
		public interface IMemberProfileRepo
		{
				public Task<IEnumerable<MemberProfile>> GetMemberProfiles(string app, int year);
				public Task<MemberProfile?> GetMemberProfiles(string app, int year, Guid userId);
				public Task<CoopOption?> GetCoopOptions(string app, int year);
				public Task<CoopOption> CreateCoopOption(CoopOption option);
				public Task<CoopOption> UpdateCoopOption(CoopOption option);

		}
}
