using AutoMapper;
using FinanceApp.Utilities;
using FinanceProject.Models;
using ModelCosmos = FinanceProject.Data.CosmosRepo.Models;

namespace FinanceApp.Data.CosmosRepo
{
		public class CosmosProfile : Profile
		{
				public CosmosProfile()
				{
						CreateMap<AccountBalance, ModelCosmos.AccountBalance>()
								.ForMember(e => e.Month, opt => opt.MapFrom(e => e.Month.ToEpoch()))
								.ReverseMap()
								.ForMember(e => e.Month, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.Month)));



						CreateMap<Transaction, ModelCosmos.Transaction>()
								.ForMember(e => e.Id, opt => opt.MapFrom(e => e.Id))
								.ForMember(e => e.Date, opt => opt.MapFrom(e => e.Date.ToEpoch()))
								.ForMember(e => e.DateAdded, opt => opt.MapFrom(e => e.DateAdded.ToEpoch()))
								.ReverseMap()
								.ForMember(e => e.Id, opt => opt.MapFrom(e => e.Id))
								.ForMember(e => e.Date, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.Date)))
								.ForMember(e => e.DateAdded, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.DateAdded)));



						CreateMap<Account, ModelCosmos.Account>()
								.ForMember(e => e.Id, opt => opt.MapFrom(e => e.Id))
								.ReverseMap()
								.ForMember(e => e.Id, opt => opt.MapFrom(e => e.Id));

						//.ForMember(e => e.Date, opt => opt.MapFrom(e => e.Date.ToEpoch()))
						//.ForMember(e => e.DateAdded, opt => opt.MapFrom(e => e.DateAdded.ToEpoch()))
						//.ReverseMap()
						//.ForMember(e => e.Date, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.Date)))
						//.ForMember(e => e.DateAdded, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.DateAdded)));
						CreateMap<ScheduledTransactions, ModelCosmos.ScheduledTransactions>()
								.ForMember(e => e.DateCreated, opt => opt.MapFrom(e => e.DateCreated.ToEpoch()))
								.ForMember(e => e.EndDate, opt => opt.MapFrom(e => e.EndDate.ToEpoch()))
								.ForMember(e => e.LastTransactionDate, opt => opt.MapFrom(e => e.LastTransactionDate.ToEpoch()))
								.ForMember(e => e.NextTransactionDate, opt => opt.MapFrom(e => e.NextTransactionDate.ToEpoch()))
								.ReverseMap()
								.ForMember(e => e.DateCreated, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.DateCreated)))
								.ForMember(e => e.EndDate, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.EndDate)))
								.ForMember(e => e.LastTransactionDate, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.LastTransactionDate)))
								.ForMember(e => e.NextTransactionDate, opt => opt.MapFrom(e => DateTime.UnixEpoch.AddSeconds(e.NextTransactionDate)));

				}
		}
}
