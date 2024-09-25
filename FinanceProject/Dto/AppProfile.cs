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

						CreateMap<CreateUserDto, User>();
				}


		}
}