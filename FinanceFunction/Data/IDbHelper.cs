using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface IDbHelper
		{
				
						public Task<int> SaveChangesAsync();
		}
}
