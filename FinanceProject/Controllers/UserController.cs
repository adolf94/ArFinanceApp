using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceApp.Dto;
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
				private readonly IMapper _mapper;

				public UserController(IScheduledTransactionRepo schedules, IUserRepo users, PersistentConfig pconfig, IMapper mapper)
				{
						_schedules = schedules;
						_pConfig = pconfig;
						_users = users;
						_mapper = mapper;
				}

				[HttpPost("user")]
			[Authorize(Roles = "Unregistered,Enroll_User")]
				public async Task<IActionResult> CreateUser(CreateUserDto user)
				{

						if(HttpContext.User.Claims.Any(e=> e.Type == ClaimTypes.Role && e.Value == "Unregistered"))
						{
								string email = HttpContext.User.FindFirstValue("email")!;
								if (user.UserName != email) return BadRequest();
						}

						User newUser = _mapper.Map<User>(user);
						await _users.CreateUser(newUser);
						//ToDo add New Access Token
						return await Task.FromResult(Ok(user));
				}

				[HttpGet("user/login")]
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
