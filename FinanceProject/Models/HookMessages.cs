using UUIDNext;

namespace FinanceApp.Models;

public class HookMessages
{
	public Guid Id { get; set; } = Uuid.NewSequential();
	public DateTime Date { get; set; } = DateTime.Now;
	public string Type { get; set; } = "";
	public string RawMsg { get; set; } = "";
	public bool IsHtml { get; set; }
}