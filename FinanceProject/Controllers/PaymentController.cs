using FinanceApp.Data;
using FinanceApp.Models;
using FinanceApp.Utilities;
using FinanceProject.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Controllers
{
		[ApiController]
		[Route("api")]
		public class PaymentController : ControllerBase

		{
				private readonly IPaymentRepo _repo;
				private readonly Sms _sms;
				private readonly ILoanRepo _loan;
				private readonly IUserRepo _user;

				public PaymentController(IPaymentRepo repo, ILoanRepo loan, IUserRepo user, Sms sms)
				{
						_repo = repo;
						_sms = sms;
						_loan = loan;
						_user = user;
				}


				[HttpPost("payment")]
				public async Task<IActionResult> PostPayment([FromBody] PaymentRecord payment)
				{
						string appId = HttpContext.User.FindFirstValue("app")!;

						User? user = await _user.GetById(payment.UserId);
						if (user == null) return BadRequest();



						await _repo.ApplyPayment(payment);
						decimal balance = await _loan.GetOutstandingBalance(payment.UserId, appId);

						await _sms.SendSms($"Thank you for you payment of {payment.Amount}. Your new outstanding balance is {balance}.",
								user!.MobileNumber, true);


						return Ok();
				}
		}
}
