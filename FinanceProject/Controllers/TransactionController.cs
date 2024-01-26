using FinanceProject.Data;
using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Immutable;

namespace FinanceProject.Controllers
{
		[Route("api/transactions")]
		[ApiController]
		public class TransactionController : ControllerBase
		{
				private readonly ITransactionRepo _repo;
				private readonly IAccountRepo _account;
				private readonly IAccountBalanceRepo _bal;
				private readonly AppDbContext _context;

				public TransactionController(ITransactionRepo repo, IAccountRepo account, IAccountBalanceRepo bal, AppDbContext context)
				{
						_repo = repo;
						_account = account;
						_bal = bal;
						_context = context;
				}
						

				[HttpPost]
				public async Task<IActionResult> CreateOne(CreateTransactionDto dto)
				{
						
						NewTransactionResponseDto response = new NewTransactionResponseDto();

						using (var transaction = _context.Database.BeginTransaction())
						{

								response.Accounts.Add(_account.UpdateCreditAcct(dto.CreditId, dto.Amount));
								response.Accounts.Add(_account.UpdateDebitAcct(dto.DebitId, dto.Amount));


								response.Balances.AddRange(_bal.UpdateCreditAcct(dto.CreditId, dto.Amount, dto.Date));
								response.Balances.AddRange(_bal.UpdateDebitAcct(dto.DebitId, dto.Amount, dto.Date));

								Transaction result = _repo.CreateTransaction(dto);
								if (result == null) return BadRequest();
								transaction.Commit();
						}



						return await Task.FromResult(Ok(response));

				}


				[HttpGet]
				public async Task<IActionResult> GetByMonth([FromQuery] int Year, [FromQuery] int Month)
				{
						IEnumerable<Transaction> transactions = _repo.GetByMonth(Year, Month);

						return await Task.FromResult(Ok(transactions));
				}

				[HttpPost]
				[Route("/bulk")]
				public async Task<IActionResult> CreateMany(IEnumerable<CreateTransactionDto> dto)
				{
						//Dictionary<Guid, Transaction> transactions = new();
						//Dictionary<Guid, Account> accounts = new();
						//dto.ToList().ForEach((itm) =>
						//{
						//		NewTransactionResponseDto result = _repo.CreateTransaction(itm);

						//		result.transactions!.ToList().ForEach((tr) =>
						//		{
						//				transactions.Remove(tr.Id);
						//				transactions.Add(tr.Id, tr);
						//		});

						//		result.accounts!.ToList().ForEach((tr) =>
						//		{
						//				accounts.Remove(tr.Id);
						//				accounts.Add(tr.Id, tr);
						//		});


						//});



						//return Ok(new NewTransactionResponseDto
						//{
						//		accounts = accounts.Values,
						//		transactions = transactions.Values
						//});
						return await Task.FromResult(Forbid());

						
				}


		}
}
