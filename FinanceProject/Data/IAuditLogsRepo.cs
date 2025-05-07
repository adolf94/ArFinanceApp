namespace FinanceApp.Data;

public interface IAuditLogsRepo
{
	public Task<Guid> AddFromRequest(HttpRequest req, HttpContext ctx);
	public Task<bool> UpdateStatus(HttpContext ctx, MemoryStream body, int status);

}