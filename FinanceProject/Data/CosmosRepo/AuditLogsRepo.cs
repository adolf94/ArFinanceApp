using System.Security.Claims;
using System.Text;
using FinanceApp.Models;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
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
				JObject jsonObj;
				try
				{
						jsonObj = JObject.Parse(bodyStr);

				}catch
				{
						jsonObj = new JObject();
				}

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
			Response = new {},
			id = auditLogId,
			_ttl = (30*24*60*60),
			StatusCode = "0"
		};
		_currentItem = JObject.FromObject(newItem);

		await _table.CreateItemAsync(_currentItem);
		
		return auditLogId;
	}

	public async Task<bool> UpdateStatus(HttpContext ctx, MemoryStream body, int status)
	{

		if (string.IsNullOrEmpty( _currentItem["UserId"]?.Value<string>() ) && ctx.User.FindFirst("userId") != null)
		{
			_currentItem["UserId"] = ctx.User.FindFirstValue("userId");
		}
		
		_currentItem["StatusCode"] = status.ToString();
		body.Position = 0;
		string jsonString =  new StreamReader(body, Encoding.UTF8).ReadToEnd();

		if (!string.IsNullOrEmpty(jsonString) &&  !ctx.Request.Path.Value!.StartsWith("/api/google/auth"))
		{
			JObject jsonObj = JObject.Parse(jsonString);
			_currentItem["Response"] = jsonObj;
		}
		
		await _table.UpsertItemAsync(_currentItem);
		
		return true;
	}

}