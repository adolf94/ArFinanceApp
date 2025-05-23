﻿using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize(Roles = "FINANCE_USER")]
		public class AccountBalanceController : ControllerBase 
		{
				private readonly IAccountBalanceRepo _repo;
				private readonly IAccountRepo _acct;

				public AccountBalanceController(IAccountBalanceRepo repo, IAccountRepo acct)
				{
						_repo = repo;
						_acct = acct;
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
						Account? acct = _acct.GetOne(acctId);

						if (acct == null) return NotFound();

						var result = await _repo.GetOne( acct, date);
						if (result == null) return NotFound();

						return await Task.FromResult(Ok(result));

				}

		}
}
