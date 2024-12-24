using FinanceApp.Models;

namespace FinanceApp.Dto
{
	public class NewContributionDto : MemberProfile.Contribution

	{
		public Guid DestinationAccount { get; set; }
	}
}