


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
	public async Task<ActionResult> GetHookMessages()
	{
		
		var items = await _repo.GetHookMessagesAsync();
		return Ok(items);


	}
	
	
}

