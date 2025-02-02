using AutoMapper;
using FinanceApp.Dto;
using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize(Roles = "FINANCE_USER")]
		public class AccountController : ControllerBase
		{
				private readonly IAccountRepo _repo;
				private readonly IMapper _mapper;

				public AccountController(IAccountRepo repo, IMapper mapper)
				{
						_repo = repo;
						_mapper = mapper;
				}

				[HttpGet("accounts")]
				public async Task<IActionResult> GetAll()
				{
						IEnumerable<Account> accounts = _repo.GetAccounts(false);
						return await Task.FromResult(Ok(accounts));
				}

				[HttpGet("accounts/{id}")]
				public async Task<IActionResult> GetOne(Guid id)
				{
						Account? accounts = _repo.GetOne(id);
						if (accounts == null) return NotFound();
						return await Task.FromResult(Ok(accounts));
				}
				[HttpPost("accounts")]
				public async Task<IActionResult> Create(AccountCreateDto type)
				{

						Account acct = _mapper.Map<Account>(type);
					
					
						_repo.Create(type);
						return await Task.FromResult(CreatedAtAction("GetOne", new { id = type.Id }, type));

				}
		}
}
