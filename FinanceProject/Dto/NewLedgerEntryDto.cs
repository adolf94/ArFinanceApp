

using FinanceApp.Models;

namespace FinanceApp.Dto
{
    public class NewLedgerEntryDto

    {
        
        public DateTime Date { get; set; }
        public Guid DebitId { get; set; }
        public Guid CreditId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; } = 0;
    }
}

