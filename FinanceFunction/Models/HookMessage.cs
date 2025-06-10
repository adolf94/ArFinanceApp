using Newtonsoft.Json.Linq;
using UUIDNext;

namespace FinanceFunction.Models;

public class HookMessage
{
	public Guid Id { get; set; } = Uuid.NewSequential();
	public DateTime Date { get; set; } = DateTime.Now;
	public string Type { get; set; } = "";
	public string RawMsg { get; set; } = "";
	public string PartitionKey { get; set; } = "default";
    public JsonDataModel? JsonData { get; set; }
	public Dictionary<string, string>? ExtractedData { get; set; }
	public bool IsHtml { get; set; } =false;
    public string? Status { get; set; } = "New";
    public Guid? TransactionId { get; set; }
		public string MonthKey { get; set; } = "";
		public int? TimeToLive { get; set; } = 60*24*60*60;


		public class ExtractedDataModel
    {
		public string matchedConfig { get; set; } = "";
		public string senderName { get; set; } = "";
        public string senderAcct { get; set; } = "";
        public string senderBank { get; set; } = "";
        public string recipientBank { get; set; } = "";
		public string recipientAcct { get; set; } = "";

        public string reference { get; set; } = "";
        public string amount { get; set; } = "";

        public string dateTime { get; set; }


    }

		public class JsonDataModel
		{
				public string action { get; set; }
				public List<string>? lines { get; set; }
				public string? fileName { get; set; }
				public string? imageId { get; set; }
				public string? timestamp { get; set; }
				public string? sms_rcv_sender { get; set; }
				public string? sms_rcv_sms_rcv_msg { get; set; }
				public string? notif_pkg { get; set; }
				public string? notif_title { get; set; }
				public string? notif_msg { get; set; }
				public string? notif_id { get; set; }
		}

}					