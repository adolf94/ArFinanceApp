using AutoMapper;
using FinanceApp.Dto;
using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class AppProfile : Profile
		{
				public AppProfile()
				{
						CreateMap<CreateTransactionDto, Transaction>()
                            .ForMember(e => e.EpochUpdated, opt => opt.MapFrom(e => new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()))
                            .ForMember(e => e.MonthKey, opt => opt.MapFrom(e=>e.Date.ToString("yyyy-MM-01")));

            CreateMap<CreateUserDto, User>()
								.ForMember(e=>e.EmailAddress, opt=>opt.MapFrom(e=>e.UserName))
								;
						
						CreateMap<AccountCreateDto, Account>()
							.ForMember(e=>e.PartitionKey, opt=>opt.MapFrom((e)=>"default"));
						
				}
				


		}
}