using System.ComponentModel.DataAnnotations;

namespace FinanceApp.Models
{
    public class MonthlyTransaction
    {
        public string MonthKey { get; set; } = "";

        public string PartitionKey { get; set; } = "default";


        public List<TransactionRef> Transactions { get; set; } = new List<TransactionRef>();
         
        public class TransactionRef
        {
            public Guid Id { get; set; }
            public long EpochUpdated { get; set; }
        }
    }
}
