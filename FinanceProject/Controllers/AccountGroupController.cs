using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize(Roles = "finance_user")]
		public class AccountGroupController : ControllerBase
		{
				private readonly IAccountGroupRepo _repo;
				public AccountGroupController(IAccountGroupRepo repo)
				{
						_repo = repo;
				}

				[HttpGet("accountgroups")]
				public async Task<IActionResult> GetAll()
				{
						IEnumerable<AccountGroup> accounts = _repo.GetAccounts();
						return await Task.FromResult(Ok(accounts));
				}

				[HttpGet("accounttypes/{type}/accountgroups")]
				public async Task<IActionResult> GetByType(Guid type)
				{
						ICollection<AccountGroup> accounts = _repo.GetByType(type);
						if (accounts == null) return NotFound();
						return await Task.FromResult(Ok(accounts));
				}
				[HttpGet("accountgroups/{id}")]
				public async Task<IActionResult> GetOne(Guid id)
				{
						AccountGroup? accounts = _repo.GetOne(id);
						if (accounts == null) return NotFound();
						return await Task.FromResult(Ok(accounts));
				}
				[HttpPost("accountgroups")]
				public async Task<IActionResult> Create(AccountGroup type)
				{
						_repo.Create(type);
						return await Task.FromResult(CreatedAtAction("GetOne", new { id = type.Id }, type));

				}
		}
}
