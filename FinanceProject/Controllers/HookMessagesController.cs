


using FinanceApp.Data;
using FinanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers;

[ApiController]
[Route("api")]
[Authorize(Roles = "FINANCE_USER")]
public class HookMessagesController : ControllerBase
{
	private readonly IHookMessagesRepo _repo;

	public HookMessagesController(IHookMessagesRepo repo)
	{
		_repo = repo;
	}

		
	[HttpGet("hookmessages")]
	public async Task<IActionResult> GetHookMessages()
	{
		
		var items = await _repo.GetHookMessagesAsync();
		return Ok(items);
	}


		[HttpGet("month/{monthkey}/hookmessages/")]
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
		public async Task<IActionResult> DeleteHook(Guid id)
		{

				var item = await _repo.GetOneHook(id);
				if (item == null) return NotFound();
				await _repo.DeleteHook(item);
				return Ok(item);
		}
}

