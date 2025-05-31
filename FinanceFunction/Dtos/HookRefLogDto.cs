namespace FinanceFunction.Dtos
{
    public class HookRefLogDto
    {
        public string ReferenceName { get; set; }
        public Guid? VendorId { get; set; }
        public string Type { get; set; }
        public Guid? AccountId { get; set; }

        public string SubConfig { get; set; } = "";
    }
}
