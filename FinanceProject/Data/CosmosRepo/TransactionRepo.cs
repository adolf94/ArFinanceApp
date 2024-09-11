using AutoMapper;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Data.CosmosRepo.Models;
using FinanceProject.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Models = FinanceProject.Models;

namespace FinanceApp.Data.CosmosRepo
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


				public Models.Transaction CreateTransaction(CreateTransactionDto item)
				{


						Models.Transaction apiTran = _mapper.Map<Models.Transaction>(item);
						Transaction tran = _mapper.Map<Transaction>(apiTran);

						_context.Transactions!.AddAsync(tran).AsTask().Wait();
						_context.SaveChangesAsync().Wait();
						return apiTran;

				}

				public Models.Transaction? GetOneTransaction(Guid id)
				{
						Task<Transaction?> task = _context.Transactions!.Where(e => e.Id == id).FirstOrDefaultAsync();
						task.Wait();
						return _mapper.Map<Models.Transaction>(task.Result);
				}


				public IEnumerable<Models.Transaction> GetByMonth(int year, int month)
				{
						long EpochDate = new DateTime(year, month, 1).ToEpoch();
						long nextMonth = new DateTime(year, month, 1).AddMonths(1).ToEpoch();
						var task = _context.Transactions!.Where(t => t.Date > EpochDate && t.Date < nextMonth)
								.ToListAsync();
						task.Wait();
						return task.Result.Select(e => _mapper.Map<Models.Transaction>(e));
				}

				public Models.Transaction UpdateTransaction(Models.Transaction item)
				{
						_context.SaveChangesAsync().Wait();
						return item;
				}

				public Task SaveChangesAsync(CancellationToken token = default)
				{
						return _context.SaveChangesAsync(token);
				}
				public async Task<IDbContextTransaction> CreateTransactionAsync()
				{
						return await _context.Database.BeginTransactionAsync();
				}

				public Models.Transaction? GetLastTransactionByAdded()
				{
						var task = _context.Transactions!.OrderByDescending(e => e.DateAdded).FirstOrDefaultAsync();
						task.Wait();
						return _mapper.Map<Models.Transaction>(task.Result);
				}
		}
}
