using AutoMapper;
using FinanceApp.Models;

namespace FinanceApp.Dto
{
		public class LoansProfile : Profile
		{
				public LoansProfile()
				{

						CreateMap<CreateLoanDto, Loans>();
						CreateMap<LoanProfile, NoNavigationLoanProfile>()
								.ReverseMap();


				}
		}
}
