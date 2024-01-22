using AutoMapper;
using FinanceProject.Dto;
using FinanceProject.Models;

namespace FinanceProject.Data.SqlRepo
{
		public class TransactionRepo : ITransactionRepo
		{
				private readonly AppDbContext _context;
				private readonly IMapper _mapper;

				public TransactionRepo(AppDbContext context, IMapper mapper)
				{
						_context = context;
						_mapper = mapper;
				}
				public Transaction CreateTransaction(CreateTransactionDto item)
				{

						Transaction tran = _mapper.Map<Transaction>(item);
						_context.Transactions!.Add(tran);
						_context.SaveChanges();
						return tran;
						
				}
		}
}
