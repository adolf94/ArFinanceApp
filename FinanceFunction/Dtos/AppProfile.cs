using AutoMapper;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using Microsoft.Extensions.DependencyInjection;

namespace FinanceFunction.Dtos;
public class AppProfile : Profile
{
		public AppProfile()
		{
				CreateMap<CreateTransactionDto, Transaction>()
												.ForMember(e => e.EpochUpdated, opt => opt.MapFrom(e => new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()))
												.ForMember(e => e.DateOlder, opt => opt.MapFrom(e => e.Date))
												.ForMember(e => e.MonthKey, opt => opt.MapFrom(e => e.Date.ToString("yyyy-MM-01")));

				CreateMap<UpdateTransactionDto, Transaction>()
										.ForMember(e => e.EpochUpdated, opt => opt.MapFrom(e => new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds()))
										.ForMember(e => e.DateOlder, opt => opt.MapFrom((e, o) => e.Date < o.DateOlder ? e.Date : o.DateOlder))
										.ForMember(e => e.Notifications, opt => opt.Ignore())
										.ForMember(e => e.MonthKey, opt => opt.MapFrom(e => e.Date.ToString("yyyy-MM-01")));

				CreateMap<CreateUserDto, User>()
						.ForMember(e => e.EmailAddress, opt => opt.MapFrom(e => e.UserName))
						;

				CreateMap<AccountCreateDto, Account>()
					.ForMember(e => e.PartitionKey, opt => opt.MapFrom((e) => "default"));

				CreateMap<HookConfig, HookConfig>();

		}



}

public static class FinanceAutomapper
{
		public static void AddFinanceAutomapper(this IServiceCollection services)
		{
				var mapperConfig = new MapperConfiguration(mc =>
				{
						//mc.SetGeneratePropertyMaps<Generate>()
						mc.AddProfile(new AppProfile());
						//mc.AddProfile(new FinanceApp.Dto.LoansProfile());
				});
				IMapper mapper = mapperConfig.CreateMapper();

				services.AddSingleton(mapper);

		}
}
