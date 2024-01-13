using AutoMapper;
using AutoMapper.EquivalencyExpression;
using FinanceProject.Data;
using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class AppProfile:Profile
    {
				public AppProfile()
				{
						CreateMap<CreateTransactionDto, Transaction>();
					
				}


    }
}