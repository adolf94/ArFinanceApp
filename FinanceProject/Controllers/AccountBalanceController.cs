using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize]
		public class AccountBalanceController : ControllerBase
		{
				private readonly IAccountBalanceRepo _repo;

				public AccountBalanceController(IAccountBalanceRepo repo)
				{
						_repo = repo;
				}

				[HttpGet("accountbalance/{date}")]
				public async Task<IActionResult> GetByDate([FromRoute] DateTime date, [FromQuery] bool? credit = null)
				{
						IEnumerable<AccountBalance> result;
						if (credit == true)
						{
								result = _repo.GetByDateCredit(date);
						}
						else
						{
								result = _repo.GetByDate(date);
						}


						return await Task.FromResult(Ok(result));
				}


				[HttpGet("account/{acctId}/accountbalance/{date}")]
				public async Task<IActionResult> GetAccountByDate(DateTime date, Guid acctId)
				{
						var result = _repo.GetByAccountWithDate(acctId, date);
						if (result == null) return NotFound();

						return await Task.FromResult(Ok(result));

				}

		}
}
