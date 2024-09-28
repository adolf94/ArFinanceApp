using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Azure.Cosmos.Linq;
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
				private readonly Sms _sms;
				private readonly ILogger<UserController> _logger;

				public UserController(IScheduledTransactionRepo schedules, IUserRepo users, ILogger<UserController> logger,
						PersistentConfig pconfig, IMapper mapper, Sms sms)
				{
						_schedules = schedules;
						_pConfig = pconfig;
						_users = users;
						_mapper = mapper;
						_sms = sms;
						_logger = logger;

				}

				[HttpPost("user")]
				[Authorize(Roles = "Unregistered,Enroll_User")]
				public async Task<IActionResult> CreateUser(CreateUserDto user)
				{
						string email = HttpContext.User.FindFirstValue(ClaimTypes.Email)!;

						if(HttpContext.User.Claims.Any(e=> e.Type == ClaimTypes.Role && e.Value == "Unregistered"))
						{
								if (user.UserName != email) return BadRequest();

								if (user.OtpGuid == null || user.OtpCode == null)
										return BadRequest(new { validation_required = "OTP Required" });

								int result = _sms.ValidateOtp(email, user.MobileNumber, user.OtpCode.Value, user.OtpGuid.Value);

								switch (result)
								{
										case -2:
												return BadRequest(new { validation_required = "Incorrect OTP", result=-2 });
										case -1:
												return BadRequest(new { validation_required = "Invalid OTP", result = -1 });
										case 0:
												return BadRequest(new { validation_required = "Expired OTP", result = 0 });
										case 1:
												break;
										default:
												_logger.LogError("Validate OTP unknown response");
												return StatusCode(500);
								}

						}
						// check if email exist
						User newUser = _mapper.Map<User>(user);
						//await _users.CreateUser(newUser);
						//ToDo add New Access Token
						return await Task.FromResult(Ok(user));
				}


				[HttpPost("otp")]
				[EnableRateLimiting("otpLimiter")]
				[Authorize]
				public async Task<IActionResult> CreateOtpRequest([FromBody] OtpRequestBody body)
				{
						string user = HttpContext.User.FindFirstValue(ClaimTypes.Email)!;



						Guid id = await _sms.CreateOtp(user, body.MobileNumber);

						return await Task.FromResult(Ok(new { id }));

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

				public class OtpRequestBody
				{
						public string MobileNumber { get; set; } = string.Empty;
        }
		}
}
