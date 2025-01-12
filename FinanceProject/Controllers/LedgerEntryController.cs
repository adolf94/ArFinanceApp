using System.Security.Claims;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers;
[Route("api")]
[ApiController]
[Authorize(Roles = "MANAGE_LOAN")]
public class LedgerEntryController: ControllerBase
{
	private readonly ILedgerEntryRepo _repo;
	private readonly ILedgerAcctRepo _accts;

	public LedgerEntryController(ILedgerEntryRepo repo, ILedgerAcctRepo accts)
	{
		_repo = repo;
		_accts = accts;
	}

	[HttpGet("ledgerentry")]
	public async  Task<IActionResult> GetLedgerEntries()
	{
		IEnumerable<LedgerEntry> items = await _repo.GetAllAsync();
		
		return Ok(items);
	}
    
    [HttpGet("ledgerentry/{month}/byDateAdded")]
	public async  Task<IActionResult> GetByMonth(string month)
	{
		IEnumerable<LedgerEntry> items = await _repo.GetByMonth(month);
		
		return Ok(items);
	}


	[HttpPost("ledgerentry")]
	[Authorize(Roles = "MANAGE_LOAN")]
	public async Task<IActionResult> AddLedgerEntry(NewLedgerEntryDto entry)
	{

		var id = HttpContext.User.FindFirstValue("userId");
		LedgerEntry item = new();
		item.Date = entry.Date;
		item.Amount = entry.Amount;
		item.AddedBy = Guid.Parse(id!);
		item.Description = entry.Description;

		LedgerAccount? credit =await  _accts.GetOne(entry.CreditId);
		if (credit == null) return BadRequest();
		
		
		
		LedgerAccount? debit =await _accts.GetOne(entry.DebitId);
		if (debit == null) return BadRequest();



		await _repo.CreateAsync(item,true);


		return Ok(item);

	}
	
    
	[HttpGet("ledgerentry/{month}/byEventDate")]
	public async  Task<IActionResult> GetByEventDate(string month)
	{
		IEnumerable<LedgerEntry> items = await _repo.GetByMonth(month);
		
		return Ok(items);
	}

}