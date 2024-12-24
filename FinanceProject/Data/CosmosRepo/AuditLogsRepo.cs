using System.Security.Claims;
using System.Text;
using FinanceApp.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using UUIDNext;

namespace FinanceApp.Data.CosmosRepo;

public class AuditLogsRepo : IAuditLogsRepo
{
	private readonly AppDbContext _context;
	private readonly Container _table;
	private JObject _currentItem;

	public AuditLogsRepo(AppDbContext context)
	{
		_context = context;
		CosmosClient client = _context.Database.GetCosmosClient();
		string dbName = _context.Database.GetCosmosDatabaseId();
		var db = client.GetDatabase(dbName);
		_table = db.GetContainer("AuditLogs");

	}


	public async Task<Guid> AddFromRequest(HttpRequest req, HttpContext ctx)
	{
		
		
		string? upn = ctx.User.FindFirstValue(ClaimTypes.Email);
		string? userId = ctx.User.FindFirstValue("userId");
			
		
		req.EnableBuffering(); 
		var bodyStr = "";

		// Arguments: Stream, Encoding, detect encoding, buffer size 
		// AND, the most important: keep stream opened
		using (StreamReader reader 
		       = new StreamReader(req.Body, Encoding.UTF8, true, 1024, true))
		{
			bodyStr = await reader.ReadToEndAsync();
		}

		// Rewind, so the core is not lost when it looks at the body for the request
		req.Body.Position = 0;
			
			
		JObject jsonObj = JObject.Parse(bodyStr);

		Guid auditLogId = Uuid.NewSequential();
		var newItem = new
		{
			Path = req.Path.Value!,
			DateLogged = DateTime.Now,
			Guid = auditLogId,
			UserId = userId,
			IpAddress = req.HttpContext.Connection.RemoteIpAddress!.ToString(),
			Email = upn ?? "",
			Body = jsonObj,
			id = auditLogId,
			StatusCode = "0"
		};
		_currentItem = JObject.FromObject(newItem);

		await _table.CreateItemAsync(_currentItem);
		
		//
		// _context.AuditLogs!.Add(item);
		// var logEntry = _context.Entry(item);
		//
		//
		// var jsonProperty = logEntry.Property<JObject>("__jObject");
		// jsonProperty.CurrentValue.Add("Body", jsonObj); 
		//
		// logEntry.State = Microsoft.EntityFrameworkCore.EntityState.Modified;
		// await _context.SaveChangesAsync();

		return auditLogId;
	}

	public async Task<bool> UpdateStatus(HttpContext ctx, int status)
	{

		if (string.IsNullOrEmpty( _currentItem["UserId"]?.Value<string>() ) && ctx.User.FindFirst("userId") != null)
		{
			_currentItem["UserId"] = ctx.User.FindFirstValue("userId");
		}
		
		_currentItem["StatusCode"] = status.ToString();
		
		await _table.UpsertItemAsync(_currentItem);
		
		return true;
	}

}