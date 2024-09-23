using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceProject.Controllers
{
		[ApiController]
		//[Authorize]
		[Route("api")]
		public class UserController : ControllerBase
		{
				private readonly IScheduledTransactionRepo _schedules;
				private PersistentConfig _pConfig;
				private readonly IUserRepo _users;

				public UserController(IScheduledTransactionRepo schedules, IUserRepo users, PersistentConfig pconfig)
				{
						_schedules = schedules;
						_pConfig = pconfig;
						_users = users;
				}

				[HttpPost("user")]
				public async Task<IActionResult> CreateUser(User user)
				{
						await _users.CreateUser(user);
						return await Task.FromResult(Ok(user));
				}

				[HttpGet("user/login")]
				[AllowAnonymous]
				public async Task<IActionResult> Login()
				{
						if (_pConfig.NextScheduledTransactionDate < DateTime.UtcNow && !_pConfig.ScheduleHasErrors)
						{
								_schedules.ProcessScheduledTransactions();
						}

						string? userId = HttpContext.User.FindFirstValue("userId");


						User? user = await _users.GetById(userId!);
						return Ok(user);
				}


		}
}
