using AutoMapper;
using FinanceApp.Models;

namespace FinanceApp.Dto
{
		public class LoansProfile : Profile
		{
				public LoansProfile()
				{

						CreateMap<CreateLoanDto, Loan>();
						CreateMap<LoanProfile, NoNavigationLoanProfile>()
								.ReverseMap();

						CreateMap<NewContributionDto, MemberProfile.Contribution>();
				}
		}
}
