using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize(Roles = "finance_user")]
		[Authorize]
		public class ScheduledTransactionsController : ControllerBase
		{
				private readonly IScheduledTransactionRepo _repo;

				public ScheduledTransactionsController(IScheduledTransactionRepo repo)
				{
						_repo = repo;
				}


				[HttpPost("scheduledtransactions")]
				public async Task<IActionResult> Create([FromBody] ScheduledTransactions item)
				{

						_repo.CreateSchedule(item);

						return await Task.FromResult(CreatedAtAction("GetOne", new { guid = item.Id }, item));

				}


				[HttpGet("scheduledTransactions/{guid}")]
				public async Task<IActionResult> GetOne(Guid guid)
				{
						ScheduledTransactions? schedule = _repo.GetOne(guid);
						if (schedule == null) return NotFound();

						return await Task.FromResult(Ok(schedule));
				}

				[HttpGet("scheduledtransactions")]
				public async Task<IActionResult> GetAll()
				{

						return await Task.FromResult(Ok(_repo.GetAll()));
				}

		}
}
