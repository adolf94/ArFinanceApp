using FinanceApp.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api")]
    public class MonthlyTransactions : ControllerBase
    { 
        private readonly IMonthlyTransactionRepo _repo;

        public MonthlyTransactions(IMonthlyTransactionRepo repo)
        {
            _repo = repo;
        }

        [HttpGet("monthlytransaction/{id}")]
        public async Task<IActionResult> GetOne(string id)
        {
            var item = await _repo.GetOne(id);
            if (item == null) return NotFound();

            return Ok(item); 

        }
    }
}
