using AutoMapper;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Authorize(Roles = "REGISTERED")]
		[Route("api")]
		public class LoanController : ControllerBase
		{
				private readonly ILoanRepo _repo;
				private readonly ILogger<LoanController> _logger;
				private readonly IMapper _mapper;
				private readonly IPaymentRepo _payment;
				private readonly IUserRepo _user;
				private readonly Sms _sms;

				public LoanController(ILoanRepo repo, IPaymentRepo payment, IUserRepo user,
						ILogger<LoanController> logger, IMapper mapper, Sms sms)
				{
						_repo = repo;
						_logger = logger;
						_mapper = mapper;
						_payment = payment;
						_user = user;
						_sms = sms;
				}

				[HttpPost("loan")]
				[Authorize(Roles = "MANAGE_LOAN")]
				public async Task<IActionResult> CreateLoan(CreateLoanDto loan)
				{

						string userId = HttpContext.User.FindFirstValue("userId")!;
						string appId = HttpContext.User.FindFirstValue("app")!;
						User? user = await _user.GetById(loan.UserId);
						if (user == null) return BadRequest();
						Loan newLoan = _mapper.Map<Loan>(loan);
						newLoan.CreatedBy = Guid.Parse(userId);
						newLoan.NextInterestDate = loan.Date;
						newLoan.NextComputeDate = loan.Date;
						newLoan.LastInterestDate = loan.Date;
						newLoan.AppId = appId;
						//TODO : process Interests
						await _repo.CreateLoan(newLoan);


						//send sms
						await _sms.SendSms($"We have recorded your loan of P {loan.Principal} with a monthly interest of {loan.LoanProfile.InterestPerMonth}% dated {loan.Date.ToString("MMM-dd")} "
								, user.MobileNumber, true);



						if (DateTime.Now > newLoan.Date.AddDays(1))
						{
								DateTime nextCompute = newLoan.NextInterestDate;
								while (nextCompute <= DateTime.Now)
								{
										var result = await _repo.ComputeInterests(newLoan, DateTime.Now);

										newLoan = result.NewLoanData;
										nextCompute = result.NextDate;

								}
						}
						//TODO SEND EMAIL AND SMS;
						//Reminder to reset interest on payment 
						return CreatedAtAction("GetOneLoan", new { id = newLoan.Id }, newLoan);
				}


				[HttpGet("member/{userId}/loan")]
				[Authorize(Roles = "COOP_MEMBER")]
				public async Task<IActionResult> GetByMember(Guid userId)
				{
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;
						string App = HttpContext.User.FindFirstValue("app")!;



						var query = await _repo.GetLoansByMemberId(userId, App);
						var items = await query

								.Where(e => e.Status == "Active")

								.ToArrayAsync();

						items = items.Select(item =>
						{
								item.Payment = _payment.GetByLoanId(item.Id);
								return item;
						}).ToArray();

						return Ok(items);


				}





				[HttpGet("user/{userId}/loan")]
				public async Task<IActionResult> GetByUser(Guid userId)
				{
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;
						string App = HttpContext.User.FindFirstValue("app")!;
						if (userId != Guid.Parse(currentUserId) && !HttpContext.User.IsInAppRole(AppRoles.MANAGE_LOAN))
						{
								return Forbid();
						}
						var query = await _repo.GetByUserId(userId, App);
						var items = await query

								.Where(e => e.Status == "Active")

								.ToArrayAsync();

						items = items.Select(item =>
						{
								item.Payment = _payment.GetByLoanId(item.Id);
								return item;
						}).ToArray();

						return Ok(items);


				}


				[HttpGet("loan/{id}")]
				public async Task<IActionResult> GetOneLoan(Guid id)
				{
						var item = await _repo.GetOneLoan(id);
						if (item == null) return NotFound();
						string currentUserId = HttpContext.User.FindFirstValue("userId")!;

						if (item.UserId != Guid.Parse(currentUserId) && !HttpContext.User.IsInAppRole(AppRoles.MANAGE_LOAN))
						{
								return Forbid();
						}
						item.Payment = _payment.GetByLoanId(item.Id);

						return await Task.FromResult(Ok(item));
				}

		}
		public class GetLoanQueryParams
		{
				public bool RemoveInactive { get; set; }
		}
}
