using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Data
{
		public interface ITransactionGroupRepo
		{
				public Task<TransactionGroup> CreateTransactionGroup(TransactionGroup item);
				public Task<TransactionGroup?> GetOneGroup(Guid id);
		}
}
