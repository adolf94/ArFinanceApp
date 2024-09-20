using AutoMapper;
using FinanceApp.BgServices;
using FinanceProject.Data;
using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
		[Route("api")]
		[ApiController]
		[Authorize]
		public class TransactionController : ControllerBase
		{
				private readonly ITransactionRepo _repo;
				private readonly IAccountRepo _account;
				private readonly IAccountBalanceRepo _bal;
				private readonly IMapper _mapper;
				private PersistentConfig _pConf;
				private readonly ILogger<TransactionController> _logger;

				public TransactionController(ITransactionRepo repo, IAccountRepo account, IAccountBalanceRepo bal,
					PersistentConfig pConfig, IMapper mapper, ILogger<TransactionController> logger)
				{
						_repo = repo;
						_account = account;
						_bal = bal;
						_mapper = mapper;
						_pConf = pConfig;
						_logger = logger;
				}


				[HttpGet]
				[Route("transactions/{id}")]
				public async Task<IActionResult> GetOne([FromRoute] Guid id)
				{
						Transaction? transaction = _repo.GetOneTransaction(id);
						if (transaction == null) return NotFound();
						return await Task.FromResult(Ok(transaction));

				}

				[HttpPost("transactions")]
				public async Task<IActionResult> CreateOne(CreateTransactionDto dto)
				{


						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<string, AccountBalance> balances = new Dictionary<string, AccountBalance>();
						//using (var transaction = await _repo.CreateTransactionAsync())
						//{


						var AcctCredit = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
						accounts[dto.CreditId] = AcctCredit;

						var accDebit = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);
						accounts[dto.DebitId] = accDebit;

						_bal.UpdateCreditAcct(dto.CreditId, dto.Amount, dto.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);
						_bal.UpdateDebitAcct(dto.DebitId, dto.Amount, dto.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);


						response.Accounts = accounts.Values.ToList();
						response.Balances = balances.Values.ToList();


						Transaction result = _repo.CreateTransaction(dto);
						if (result == null)
						{
								//transaction.Rollback();
								return BadRequest();
						}
						//transaction.Commit();

						response.Transaction = result;
						_pConf.LastTransactionId = result.Id.ToString();
						//}



						return await Task.FromResult(Ok(response));

				}


				[HttpPut("transactions/{id}")]
				public async Task<IActionResult> UpdateOne([FromRoute] Guid id, [FromBody] CreateTransactionDto dto)
				{


						Transaction? transaction = _repo.GetOneTransaction(id);
						if (transaction == null) return NotFound();


						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<string, AccountBalance> balances = new Dictionary<string, AccountBalance>();
						await _bal.CreateAccountBalances(dto.Date);

						//using (var trans = await _repo.CreateTransactionAsync())
						//{

						//try
						//{
						//Reverse the transactions
						accounts[transaction.CreditId] = _account.UpdateCreditAcct(transaction.CreditId, -transaction.Amount);
						accounts[transaction.DebitId] = _account.UpdateDebitAcct(transaction.DebitId, -transaction.Amount);
						_bal.UpdateCreditAcct(transaction.CreditId, -transaction.Amount, transaction.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);
						_bal.UpdateDebitAcct(transaction.DebitId, -transaction.Amount, transaction.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);



						accounts[dto.CreditId] = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
						accounts[dto.DebitId] = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);
						_bal.UpdateCreditAcct(dto.CreditId, dto.Amount, dto.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);
						_bal.UpdateDebitAcct(dto.DebitId, dto.Amount, dto.Date)
									.ToList().ForEach(bal =>
												balances[bal.Id] = bal);



						_mapper.Map(dto, transaction);

						response.Accounts = accounts.Values.ToList();
						response.Balances = balances.Values.ToList();

						transaction.DateAdded = DateTime.UtcNow;
						Transaction result = _repo.UpdateTransaction(transaction);
						if (result == null)
						{
								//trans.Rollback();
								return BadRequest();
						}
						_pConf.LastTransactionId = result.Id.ToString();
						response.Transaction = result;
						//trans.Commit();
						//}
						//catch (Exception ex)
						//{
						//		trans.Rollback();
						//		return BadRequest();
						//}
						//}



						return await Task.FromResult(Ok(response));

				}


				[HttpGet("transactions")]
				public async Task<IActionResult> GetByMonth([FromQuery] GetTransactionsQueryParams @params)
				{
						IEnumerable<Transaction> transactions = Array.Empty<Transaction>();
						if (@params.Year.HasValue && @params.Month.HasValue)
						{
								transactions = _repo.GetByMonth(@params.Year.Value, @params.Month.Value);
						}
						else if (@params.After.HasValue)
						{
								transactions = await _repo.GetTransactionsAfter(@params.After.Value);
						}



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
		public class GetTransactionsQueryParams
		{
				public Guid? After { get; set; }
				public int? Month { get; set; }
				public int? Year { get; set; }
		}
}
