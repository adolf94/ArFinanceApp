using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models.SubModels;
using FinanceApp.Utilities;
using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using FinanceApp.Models;

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
				private readonly ILedgerAcctRepo _ledgerAcct;

				public UserController(IScheduledTransactionRepo schedules, IUserRepo users, ILogger<UserController> logger,
						PersistentConfig pconfig, IMapper mapper, Sms sms, ILedgerAcctRepo ledgeracct)
				{
						_schedules = schedules;
						_pConfig = pconfig;
						_users = users;
						_mapper = mapper;
						_sms = sms;
						_logger = logger;
						_ledgerAcct = ledgeracct;

				}

				[HttpPost("user")]
				[Authorize(Roles = "Unregistered,ENROLL_USER")]
				public async Task<IActionResult> CreateUser(CreateUserDto user)
				{
				
					bool isRegistered = !HttpContext.User.Claims.Any(e => e.Type == ClaimTypes.Role && e.Value == "Unregistered");
					string? userId = HttpContext.User.FindFirstValue("userId");
						if (!isRegistered)
						{
								string email = HttpContext.User.FindFirstValue(ClaimTypes.Email)!;
								if (user.UserName != email) return BadRequest();

								if (user.OtpGuid == null || user.OtpCode == null)
										return BadRequest(new { validation_required = "OTP Required" });

								int result = _sms.ValidateOtp(email, user.MobileNumber, user.OtpCode.Value, user.OtpGuid.Value);

								switch (result)
								{
										case -2:
												return BadRequest(new { validation_required = "Incorrect OTP", result = -2 });
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
						User? newUser = null;
						if (!string.IsNullOrEmpty(user.UserName))
						{
								newUser = await _users.GetByEmailAsync(user.UserName);
								if (newUser != null)
								{
										return BadRequest(new { user_exist = "email", result = -3 });
								}
						}


						if (!string.IsNullOrEmpty(user.MobileNumber))
						{
								newUser = await _users.GetByMobile(user.MobileNumber);

								if (newUser == null)
								{
										newUser = _mapper.Map<User>(user);
										newUser.DisbursementAccounts.Add(new DisbursementAccount { AccountId = "0", AccountName = "Cash", BankName = "Cash" });

									

										LedgerAccount ledger = new LedgerAccount
										{
											AddedBy = !string.IsNullOrEmpty(userId) ? Guid.Parse(userId) : newUser.Id,
											DateAdded = DateTime.UtcNow,
											Balance = 0,
											LedgerAcctId = Guid.NewGuid(),
											Name = $"Receivables - {newUser.Name}",
											Section = "receivables"
											};
											newUser.AcctReceivableId = ledger.LedgerAcctId;
										await _ledgerAcct.CreateLedgerAccount(ledger);
										await _users.CreateUser(newUser);
										return Ok(newUser);
								}
								else if (!string.IsNullOrEmpty(newUser.UserName))
								{
										string[] parts = newUser.UserName.Split("@");
										string first3 = parts[0].Substring(0, 3);
										string last = parts[0].Substring(parts[1].Length);
										return BadRequest(new { user_exist = "mobile", email = $"{first3}***{last}@{parts[1]}", result = -4 });
								}
								else if (isRegistered)
								{
										return BadRequest(new { user_exist = "mobile", email = $"", result = -5 });
								}


								if (!isRegistered)
								{
									List<Claim> claims = [new Claim("userId", newUser.Id.ToString())];
									HttpContext.User.AddIdentity(new ClaimsIdentity(claims));
								}

								newUser.UserName = user.UserName;
								await _users.UpdateUser(newUser);
								return await Task.FromResult(Ok(newUser));
						}

						//ToDo add New Access Token
						return BadRequest(new { validation_required = "Mobile Number is required" });
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
				[Authorize]

				public async Task<IActionResult> Login()
				{
						if (_pConfig.NextScheduledTransactionDate < DateTime.UtcNow && !_pConfig.ScheduleHasErrors)
						{
								_schedules.ProcessScheduledTransactions();
						}

						string? userId = HttpContext.User.FindFirstValue("userId");


						User? user = await _users.GetById(Guid.Parse(userId!));
						return Ok(user);
				}

				[HttpGet("user")]
				public async Task<IActionResult> GetAllUsers()
				{
						User[] users = await _users.GetAll();
						return Ok(users);
				}

				[HttpGet("user/{userId}")]
				[Authorize(Roles = "MANAGE_LOAN,COOP_MEMBER")]
				public async Task<IActionResult> GetOne(Guid userId)
				{
						User? user = await _users.GetById(userId);
						if (user == null) return NotFound();

						return Ok(user);
				}

				[HttpPost("user/{id}/disbursementaccount")]
				public async Task<IActionResult> AddDisbursementAccount(Guid id, DisbursementAccount acct)
				{

						User? user = await _users.GetById(id);
						if (user == null) return NotFound();
						user.DisbursementAccounts.Add(acct);
						await _users.UpdateUser(user);
						return NoContent();

				}


				public class OtpRequestBody
				{
						public string MobileNumber { get; set; } = string.Empty;
				}
		}
}
