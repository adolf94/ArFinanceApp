using FinanceApp.Data;
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

	public LedgerEntryController(ILedgerEntryRepo repo)
	{
		_repo = repo;
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
    
	
    
	[HttpGet("ledgerentry/{month}/byEventDate")]
	public async  Task<IActionResult> GetByEventDate(string month)
	{
		IEnumerable<LedgerEntry> items = await _repo.GetByMonth(month);
		
		return Ok(items);
	}

}