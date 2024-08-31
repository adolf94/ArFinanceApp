using AutoMapper;
using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class AppProfile : Profile
		{
				public AppProfile()
				{
						CreateMap<CreateTransactionDto, Transaction>();

				}


		}
}