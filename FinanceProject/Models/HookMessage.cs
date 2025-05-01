using Newtonsoft.Json.Linq;
using UUIDNext;

namespace FinanceApp.Models;

public class HookMessage
{
	public Guid Id { get; set; } = Uuid.NewSequential();
	public DateTime Date { get; set; } = DateTime.Now;
	public string Type { get; set; } = "";
	public string RawMsg { get; set; } = "";
	public string PartitionKey { get; set; } = "default";
	public JObject? JsonData { get; set; }
	public ExtractedDataModel? ExtractedData { get; set; }
	public bool IsHtml { get; set; } =false;


	public class ExtractedDataModel
    {
		public string matchedConfig { get; set; } = "";
		public string senderName { get; set; } = "";
        public string senderAcct { get; set; } = "";
		public string recipientBank { get; set; } = "";
		public string recipientAcct { get; set; } = "";
		public string reference { get; set; } = "";
        public string amount { get; set; } = "";


    }

}					