namespace FinanceApp.Models
{
    public class HookReference
    {
        public Guid Id { get; set; }
        public string ReferenceName { get; set; }
        public string VendorId { get; set; }
        public string Type { get; set; } 
        public string AccountId { get; set; }
        public int Hits { get; set; } = 0;
    }
}
