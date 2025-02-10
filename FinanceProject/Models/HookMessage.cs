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
	public JObject? ExtractedData { get; set; }
	public bool IsHtml { get; set; } =false;
}					