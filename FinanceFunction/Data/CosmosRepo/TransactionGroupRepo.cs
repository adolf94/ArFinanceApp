using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class TransactionGroupRepo : ITransactionGroupRepo
		{
				private readonly AppDbContext _context;

				public TransactionGroupRepo(AppDbContext context)
				{
						_context = context;
				}

				public async Task<TransactionGroup> CreateTransactionGroup(TransactionGroup item)
				{
						await _context.TransactionGroups.AddAsync(item);
						return item;
				}

				public async Task<TransactionGroup?> GetOneGroup(Guid id)
				{
						return await _context.TransactionGroups.Where(e=>e.Id == id).FirstOrDefaultAsync();
				}
		}
}
