using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data.CosmosRepo
{
		public class IDbHelper
		{
				private readonly AppDbContext _context;
				private readonly CancellationToken _cancelToken;

				public IDbHelper(AppDbContext context, CancellationToken token)
				{
						_context = context;
						_cancelToken = token;
				}

				public async Task<int> SaveChangesAsync()
				{
						return await _context.SaveChangesAsync(_cancelToken);
				}

		}
}
