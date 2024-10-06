using FinanceApp.Data;
using FinanceApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Route("api")]
		public class PaymentController : ControllerBase
				
		{
				private readonly IPaymentRepo _repo;

				public PaymentController(IPaymentRepo repo)
        {
            _repo = repo;
        }


				[HttpPost("payment")]
				public async Task<IActionResult> PostPayment([FromBody] PaymentRecord payment)
				{

						await _repo.ApplyPayment(payment);

						return Ok();
				}
    }
}
