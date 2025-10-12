using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using UUIDNext;

namespace FinanceFunction.Models
{
    public class Transaction
    {
        public Guid Id { get; set; } = Uuid.NewSequential();
        public long EpochUpdated { get; set; } = new DateTimeOffset(DateTime.UnixEpoch).ToUnixTimeSeconds();

        public string Type { get; set; } = "";

        public Guid CreditId { get; set; }
        public Account? Credit { get; set; }

        public Guid DebitId { get; set; }
        public Account? Debit { get; set; }

        public decimal Amount { get; set; }
        public Guid? AddByUserId { get; set; }
        public User? AddByUser { get; set; }

        public Guid? VendorId { get; set; }
        public Vendor? Vendor { get; set; }

        public DateTime Date { get; set; }
        public string Reference { get; set; } = "";
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        public Guid? ScheduleId { get; set; }
        [JsonIgnore]
        public ScheduledTransactions? Schedule { get; set; }
        [JsonIgnore]
        public ScheduledTransactions? AsLastTransaction { get; set; }

        public string Description { get; set; }
        public string MonthKey { get; set; } = "";
				public List<string> Notifications { get; set; } = new List<string>();


        [MaxLength(100)]
        public string PartitionKey { get; init; } = "default";
        public List<BalanceAccount> BalanceRefs { get; set; } = new List<BalanceAccount>();

    }

    public class BalanceAccount
    {
        public string AccountBalanceKey { get; set; } = "";
        public Guid AccountId { get; set; }
        public bool IsDebit { get; set; }
    }
}
