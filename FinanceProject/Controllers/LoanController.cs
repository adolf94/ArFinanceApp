using AutoMapper;
using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Authorize]
		[Route("api")]
		public class LoanController : ControllerBase
		{
				private readonly ILoanRepo _repo;
				private readonly ILogger<LoanController> _logger;
				private readonly IMapper _mapper;
				private readonly IPaymentRepo _payment;

				public LoanController(ILoanRepo repo, IPaymentRepo payment, ILogger<LoanController> logger, IMapper mapper)
				{
						_repo = repo;
						_logger = logger;
						_mapper = mapper;
						_payment = payment;
				}

				[HttpPost("loan")]
				public async Task<IActionResult> CreateLoan(CreateLoanDto loan)
				{

						string userId = HttpContext.User.FindFirstValue("userId")!;
						string appId = HttpContext.User.FindFirstValue("app")!;

						Loans newLoan = _mapper.Map<Loans>(loan);
						newLoan.CreatedBy = Guid.Parse(userId);
						newLoan.NextInterestDate = loan.Date;
						newLoan.LastInterestDate = loan.Date;
						newLoan.AppId = appId;
						//TODO : process Interests
						await _repo.CreateLoan(newLoan);

						if (DateTime.Now > newLoan.Date.AddDays(1))
						{
								DateTime nextDate = newLoan.NextInterestDate;
								while (nextDate <= DateTime.Now)
								{
										var result = await _repo.ComputeInterests(newLoan, DateTime.Now);
										newLoan = result.NewLoanData;
										nextDate = result.NextDate;
								}
						}
						//TODO SEND EMAIL AND SMS;
						//Reminder to reset interest on payment 

						return CreatedAtAction("GetOneLoan", new { id = newLoan.Id }, newLoan);
				}



				[HttpGet("user/{userId}/loan")]
				public async Task<IActionResult> GetByUser(Guid userId)
				{
						var query = await _repo.GetByUserId(userId);
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
						item.Payment = _payment.GetByLoanId(item.Id);

						return await Task.FromResult(Ok(item));
				}

		}
		public class GetLoanQueryParams
		{
				public bool RemoveInactive { get; set; }
		}
}
