namespace FinanceApp.Models
{
    public class HookReference
    {
        public Guid Id { get; set; }
        public string ReferenceName { get; set; }
        public Guid? VendorId { get; set; }
        public string Type { get; set; } 
        public Guid? AccountId { get; set; }
        public int Hits { get; set; } = 0;
        public string PartitionKey { get; set; } = "default";

        public Dictionary<string, int> ConfigHits { get; set; } = new Dictionary<string, int>();
    }
}
