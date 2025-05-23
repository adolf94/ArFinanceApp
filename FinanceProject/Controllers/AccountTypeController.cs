﻿using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize(Roles = "FINANCE_USER")]
		public class AccountTypeController : ControllerBase
		{
				private IAccountTypeRepo _repo;
				public AccountTypeController(IAccountTypeRepo repo)
				{
						_repo = repo;
				}


				[HttpGet("accounttypes")]
				public async Task<IActionResult> GetAll()
				{
						return await Task.FromResult(Ok(_repo.GetAllType()));

				}

				[HttpGet("accounttypes/{id}")]
				public async Task<IActionResult> GetOne(Guid id)
				{
						AccountType? accounts = _repo.GetOne(id);

						if (accounts == null) return NotFound();

						return await Task.FromResult(Ok(accounts));

				}


				[HttpPost("accounttypes")]
				public async Task<IActionResult> Create(AccountType type)
				{
						await _repo.Create(type);
						return await Task.FromResult(CreatedAtAction("GetOne", new { id = type.Id }, type));

				}
		}
}
