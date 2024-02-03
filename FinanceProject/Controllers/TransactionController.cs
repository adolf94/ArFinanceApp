using AutoMapper;
using FinanceProject.Data;
using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Immutable;
using static FinanceProject.Dto.NewTransactionResponseDto;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		public class TransactionController : ControllerBase
		{
				private readonly ITransactionRepo _repo;
				private readonly IAccountRepo _account;
				private readonly IAccountBalanceRepo _bal;
				private readonly AppDbContext _context;
				private readonly IMapper _mapper;

				public TransactionController(ITransactionRepo repo, IAccountRepo account, IAccountBalanceRepo bal, AppDbContext context, IMapper mapper)
				{
						_repo = repo;
						_account = account;
						_bal = bal;
						_context = context;
						_mapper = mapper;
				}


				[HttpGet]
				[Route("transactions/{id}")]
				public async Task<IActionResult> GetOne([FromRoute] Guid id) 
				{
						Transaction? transaction = _repo.GetOneTransaction(id);
						if(transaction == null)	 return NotFound();
						return await Task.FromResult(Ok(transaction));
				
				}

				[HttpPost("transactions")]
				public async Task<IActionResult> CreateOne(CreateTransactionDto dto)
				{

						_bal.CreateAccountBalances(dto.Date);

						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<AccountBalanceKey, AccountBalance> balances = new Dictionary<AccountBalanceKey, AccountBalance>();
						using (var transaction = _context.Database.BeginTransaction())
						{

								accounts[dto.CreditId] = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
								accounts[dto.DebitId] = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);

								_bal.UpdateCreditAcct(dto.CreditId, dto.Amount, dto.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);
								_bal.UpdateDebitAcct(dto.DebitId, dto.Amount, dto.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);


								response.Accounts = accounts.Values.ToList();
								response.Balances = balances.Values.ToList();
								

								Transaction result = _repo.CreateTransaction(dto);
								if (result == null) return BadRequest();
								transaction.Commit();

								response.Transaction = result;
						}



						return await Task.FromResult(Ok(response));

				}


				[HttpPut("transactions/{id}")]
				public async Task<IActionResult> UpdateOne([FromRoute] Guid id, [FromBody]CreateTransactionDto dto)
				{


						Transaction? transaction = _repo.GetOneTransaction(id);
						if (transaction == null) return NotFound();


						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<AccountBalanceKey, AccountBalance> balances = new Dictionary<AccountBalanceKey, AccountBalance>();
						_bal.CreateAccountBalances(dto.Date);

						using (var trans = _context.Database.BeginTransaction())
						{

								//Reverse the transactions
								accounts[transaction.CreditId] = _account.UpdateCreditAcct(transaction.CreditId, -transaction.Amount);
								accounts[transaction.DebitId] = _account.UpdateDebitAcct(transaction.DebitId, -transaction.Amount);
								_bal.UpdateCreditAcct(transaction.CreditId, -transaction.Amount, transaction.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);
								_bal.UpdateDebitAcct(transaction.DebitId, -transaction.Amount, transaction.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);



								accounts[dto.CreditId] = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
								accounts[dto.DebitId] = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);
								_bal.UpdateCreditAcct(dto.CreditId, dto.Amount, dto.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);
								_bal.UpdateDebitAcct(dto.DebitId, dto.Amount, dto.Date)
											.ToList().ForEach(bal =>
														balances[new AccountBalanceKey(bal.AccountId, bal.Month)] = bal);



								_mapper.Map(dto, transaction);

								response.Accounts = accounts.Values.ToList();
								response.Balances = balances.Values.ToList();

								Transaction result = _repo.UpdateTransaction(transaction);
								if (result == null) return BadRequest();
								response.Transaction = result;
								trans.Commit();
						}



						return await Task.FromResult(Ok(response));

				}


				[HttpGet("transactions")]
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
