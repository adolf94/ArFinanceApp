using AutoMapper;

namespace FinanceApp.Data.CosmosRepo.Dtos
{
		public class CosmosProfile : Profile
		{
				private readonly AppDbContext _ctx;

				public CosmosProfile(AppDbContext ctx) {
						_ctx = ctx;




				}


				


		}
}
