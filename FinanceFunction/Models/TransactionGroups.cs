using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UUIDNext;

namespace FinanceFunction.Models
{
		public class TransactionGroup
		{
				public Guid Id { get; set; } = Uuid.NewSequential();
				public DateTime Date { get; set; } = DateTime.UtcNow;
				public Guid? AccountId { get; set; }
				public string Type { get; set; } = "expense";
				public Guid? VendorId { get; set; }
				public decimal Total { get; set; }
				public string PartitionKey { get; set; } = "default";
				public List<SplitBatchRecord> Items { get; set; } = new();

				public class SplitBatchRecord
				{
						public Guid Id { get; set; } = Uuid.NewSequential();
						public string Linked { get; set; } = "";
						public Guid ExpenseId { get; set; }
						public string Description { get; set; } = "";
						public string Reference { get; set; } = "";
						public string State { get; set; } = "";
						public decimal Amount { get; set; }
				}
		}

}
