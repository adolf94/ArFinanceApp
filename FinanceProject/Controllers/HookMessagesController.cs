


using FinanceApp.Data;
using FinanceApp.Models;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace FinanceApp.Controllers;

[ApiController]
[Route("api")]
[Authorize(Roles = "FINANCE_USER")]
public class HookMessagesController : ControllerBase
{
		private readonly AppConfig _config;
		private readonly IHookMessagesRepo _repo;


	public HookMessagesController(IHookMessagesRepo repo, AppConfig config)
	{
				_config = config;
				_repo = repo;
	}

		
	[HttpGet("hookmessages")]
	public async Task<IActionResult> GetHookMessages()
	{
		
		var items = await _repo.GetHookMessagesAsync();
		return Ok(items);
	}


		[HttpGet("month/{monthkey}/hookmessages")]
		public async Task<IActionResult> GetByMonth(DateTime  monthkey)
		{

				var items = await _repo.GetHookMessagesMonthAsync(monthkey);
				return Ok(items);
		}

		[HttpGet("hookmessages/{id}")]
	public async Task<IActionResult> GetOneHookMessage(Guid id)
	{

        var item = await _repo.GetOneHook(id);
		if (item == null) return NotFound();
        return Ok(item);
    }



		[HttpDelete("hookmessages/{id}")]
		public async Task<IActionResult> DeleteHook(string id)
		{

				var guid = Guid.Parse(id);

				var item = await _repo.GetOneHook(guid);
				if (item == null) return NotFound();
				await _repo.DeleteHook(item);
				return Ok(item);
		}
		[HttpDelete("hookmessages/{id}/reprocess")]
		public async Task<IActionResult> Reprocess(string id)
		{

				var guid = Guid.Parse(id);

				var item = await _repo.GetOneHook(guid);
				if (item == null) return NotFound();

				var httpClient = new HttpClient();
				httpClient.BaseAddress = new Uri(_config.FinanceHook.HookUrl);
				httpClient.DefaultRequestHeaders.Add("x-api-key", _config.FinanceHook.Key);


				var jsonString = JsonSerializer.Serialize(item.JsonData);
				StringContent content = new StringContent(jsonString, Encoding.UTF8, "application/json");
				var response = await httpClient.PostAsync("/api/phone_hook", content);
				HookHookReprocess? body = new();
				response.EnsureSuccessStatusCode();

				body = await response.Content.ReadFromJsonAsync<HookHookReprocess>(new JsonSerializerOptions
				{
						PropertyNameCaseInsensitive = false,
						AllowTrailingCommas = true,
						DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
						ReadCommentHandling = JsonCommentHandling.Skip // Skip comments in JSON
																														// Enables case-insensitive matching
				});



				await _repo.DeleteHook(item);
				var newItem = await _repo.GetOneHook(Guid.Parse(body!.Id));

				return CreatedAtAction(nameof(GetOneHookMessage), new { id =body.Id! }, newItem);
		}
}

public class HookHookReprocess
{
		public string Id { get; set; }
};