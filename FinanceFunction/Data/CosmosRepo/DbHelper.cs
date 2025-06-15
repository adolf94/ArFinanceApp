using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class DbHelper : IDbHelper
		{
				private readonly AppDbContext _context;
				private readonly CancellationToken _cancelToken;

				public DbHelper(AppDbContext context, CancellationToken token)
				{
						_context = context;
						_cancelToken = token;
				}

				public async Task<int> SaveChangesAsync()
				{
						
						var i = await _context.SaveChangesAsync(_cancelToken);
						_context.ChangeTracker.Clear();
						return i;
				}

		}
}
