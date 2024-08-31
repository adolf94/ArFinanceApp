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

				public Transaction? GetOneTransaction(Guid id)
				{
						return _context.Transactions!.Find(id);
				}


				public IEnumerable<Transaction> GetByMonth(int year, int month)
				{
						return _context.Transactions!.Where(t => t.Date.Month == month && t.Date.Year == year)
								.ToList();
				}

				public Transaction UpdateTransaction(Transaction item)
				{
						_context.SaveChanges();
						return item;
				}

				public Transaction? GetLastTransactionByAdded()
				{
						throw new NotImplementedException();
				}
		}
}
