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

				public TransactionController(ITransactionRepo repo)
				{
						_repo = repo;
				}


				[HttpPost]
				public async Task<IActionResult> CreateOne(CreateTransactionDto dto)
				{
						Transaction result = _repo.CreateTransaction(dto);
						if (result == null) return BadRequest();

						return await Task.FromResult(Ok(result));

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
