using FinanceApp.Data;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FinanceApp.Models;

namespace FinanceApp.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class LedgerAcctController: ControllerBase
{
	private readonly ILedgerAcctRepo _repo;

	public LedgerAcctController(ILedgerAcctRepo repo)
	{
		_repo = repo;
	}


	[HttpGet("ledgeracct")]
	public async Task<IActionResult> GetLedgerAcct()
	{
		var items = await _repo.GetAllLedgerAccounts();
		
		return Ok(items);
	} 
	
	[HttpGet("ledgeracct/{id}")]
	public async Task<IActionResult> GetOneLedgerAcct(Guid id)
	{
		var items = await _repo.GetOne(id);
		if(items == null) return NotFound();
		return Ok(items);
	} 

	[HttpPost("ledgeracct")]
	public async Task<IActionResult> CreateLedgerAcct([FromBody]CreateLedgerAccount item)
	{
		
		string? currentUser = HttpContext.User.FindFirstValue("userId");

		
		LedgerAccount acct = new LedgerAccount
		{
			Name = item.Name,
			Section = item.Section,
			AddedBy = Guid.Parse(currentUser!)
		};

		var result = await _repo.CreateLedgerAccount(acct);
		
		return CreatedAtAction("GetOneLedgerAcct", new {id = result.LedgerAcctId }, result);
	} 
	
	
	
	
}

public class CreateLedgerAccount
{
	public string Name { get; set; }
	public string Section { get; set; }
}