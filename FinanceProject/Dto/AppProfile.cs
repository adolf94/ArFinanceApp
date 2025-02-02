using AutoMapper;
using FinanceApp.Dto;
using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class AppProfile : Profile
		{
				public AppProfile()
				{
						CreateMap<CreateTransactionDto, Transaction>();

						CreateMap<CreateUserDto, User>()
								.ForMember(e=>e.EmailAddress, opt=>opt.MapFrom(e=>e.UserName))
								;
						
						CreateMap<AccountCreateDto, Account>()
							.ForMember(e=>e.PartitionKey, opt=>opt.MapFrom((e)=>"default"));
						
				}
				


		}
}