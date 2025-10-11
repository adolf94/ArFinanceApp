using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using UUIDNext;

namespace FinanceFunction.Data.CosmosRepo
{
		public class AuditLogRepo : IAuditLogRepo
		{

				private readonly AppDbContext _context;
				private readonly Container _table;
				private JObject? _currentItem;
				private CurrentUser _user;

				public AuditLogRepo(AppDbContext context, CurrentUser user)
				{
						_context = context;
						_user = user;
						CosmosClient client = _context.Database.GetCosmosClient();
						string dbName = _context.Database.GetCosmosDatabaseId();
						var db = client.GetDatabase(dbName);
						_table = db.GetContainer("AuditLogs");
				}


				public async Task<Guid> AddFromRequest(HttpRequest req)
				{


						string? upn = _user.EmailAddress;
						string? userId = _user.UserId.ToString();


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

						}
						catch
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
								Response = new { },
								id = auditLogId,
								_ttl = (45 * 24 * 60 * 60),
								StatusCode = "0"
						};
						_currentItem = JObject.FromObject(newItem);

						//await _table.CreateItemAsync(_currentItem);

						return auditLogId;
				}


				public async Task<Guid> AddLogging(object requestBody, string path, string ip)
				{

						string? upn = _user.EmailAddress;
						string? userId = _user.UserId.ToString();
						JObject jsonObj;
						try
						{
								jsonObj = JObject.FromObject(requestBody);

						}
						catch
						{
								jsonObj = new JObject();
						}
						Guid auditLogId = Uuid.NewSequential();
						var newItem = new
						{
								Path = path,
								DateLogged = DateTime.Now,
								Guid = auditLogId,
								UserId = userId,
								IpAddress = ip,
								Email = upn ?? "",
								Body = jsonObj,
								Response = new { },
								id = auditLogId,
								_ttl = (45 * 24 * 60 * 60),
								StatusCode = "0"
						};
						_currentItem = JObject.FromObject(newItem);

						//await _table.CreateItemAsync(_currentItem);

						return await Task.FromResult(auditLogId);
				}

				public async Task<bool> UpdateStatus( int status, Stream body)
				{
						if (_currentItem == null) return false;

						_currentItem!["StatusCode"] = status.ToString();

						body.Position = 0;
						Console.WriteLine($"Length = ${body.Length} ");
						string jsonString;
						using (var reader = new StreamReader(body, Encoding.UTF8, detectEncodingFromByteOrderMarks: false, bufferSize: 4096, leaveOpen: true))
						{
								jsonString = await reader.ReadToEndAsync();
						}



						if (!string.IsNullOrEmpty(jsonString))
						{
								JObject jsonObj = JObject.Parse(jsonString);
								_currentItem["Response"] = jsonObj;
						}

						await _table.UpsertItemAsync(_currentItem);

						_currentItem = null;
						return true;
				}


				public async Task<bool> UpdateStatus(int status, object body)
				{
						if (_currentItem == null) return false;
						_currentItem!["StatusCode"] = status.ToString();

						if(body == null)
						{
								_currentItem["Response"] = null;
						}
						else
						{
								JObject jsonObj = JObject.FromObject(body);
								_currentItem["Response"] = jsonObj;

						}

						await _table.UpsertItemAsync(_currentItem);

						_currentItem = null;
						return true;

				}
		}

}
