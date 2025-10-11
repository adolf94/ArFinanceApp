using AutoMapper;
using FinanceFunction.Data;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction
{
		public class TransactionController
		{
				private ITransactionRepo _repo;
				private readonly IAccountRepo _account;
				private readonly IAccountBalanceRepo _bal;
				private readonly IMonthlyTransactionRepo _monthly;
				private readonly IMapper _mapper;
				private readonly ILogger<TransactionController> _logger;
				private readonly IHookMessagesRepo _hooks;
				private readonly CurrentUser _user;
				private readonly IAuditLogRepo _audit;
				private readonly IScheduledTransactionRepo _schedules;

				public TransactionController(ITransactionRepo repo, IAccountRepo acct, IAccountBalanceRepo bal, IMonthlyTransactionRepo monthly, IAuditLogRepo audit,
						IMapper mapper, ILogger<TransactionController> logger, IHookMessagesRepo hooks, CurrentUser user, IScheduledTransactionRepo schedules)
				{
						_repo = repo;
						_account = acct;
						_bal = bal;
						_monthly = monthly;
						_mapper = mapper;
						_logger = logger;
						_hooks = hooks;
						_user = user;
						_audit = audit;
						_schedules = schedules;
				}

				[Function("GetOneTransaction")]
				public async Task<IActionResult> GetOne([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "transactions/{id}")]
				HttpRequest req, Guid id)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();

						Transaction? transaction = _repo.GetOneTransaction(id);
						if (transaction == null) return new NotFoundResult();
						return await Task.FromResult(new OkObjectResult(transaction));

				}

				[Function("CreateTransactions")]
				public async Task<IActionResult> CreateOne([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "transactions")]
				HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();


						var dto = await req.ReadFromJsonAsync<CreateTransactionDto>();



						NewTransactionResponseDto response;

						try
						{
								response = await CreateOneTransaction(dto);
						}
						catch (Exception ex)
						{
								if(ex.Message == "BadRequest")
								{
										return new BadRequestResult();
								}
								throw;
						}


						return await Task.FromResult(new OkObjectResult(response));

				}

				public async Task<NewTransactionResponseDto> CreateOneTransaction(CreateTransactionDto dto)
				{


						await _audit.AddLogging(dto, "transactions", "");

						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<string, AccountBalance> balances = new Dictionary<string, AccountBalance>();
						//using (var transaction = await _repo.CreateTransactionAsync())
						//{

						Transaction item = _mapper.Map<Transaction>(dto);

						//to do -- add try catch with rollback transactions

						//get was separated vs update, as create balances was using the updated balance when creating new Account Balance
						var AcctCredit = _account.GetOne(dto!.CreditId)!;

						var creditBal = await _bal.CreateBalances(AcctCredit, dto.Date);
						AcctCredit = _account.UpdateCreditAcct(dto!.CreditId, dto.Amount);
						accounts[dto.CreditId] = AcctCredit;
						item.BalanceRefs.Add(new BalanceAccount
						{
								AccountId = dto.CreditId,
								AccountBalanceKey = creditBal.Id,
								IsDebit = false
						});

						//get was separated vs update, as create balances was using the updated balance when creating new Account Balance
						var accDebit = _account.GetOne(dto.DebitId)!;

						var debitBal = await _bal.CreateBalances(accDebit, dto.Date);
						accDebit = _account.UpdateDebitAcct(dto!.DebitId, dto.Amount);
						accounts[dto.DebitId] = accDebit;
						item.BalanceRefs.Add(new BalanceAccount
						{
								AccountId = dto.DebitId,
								AccountBalanceKey = debitBal!.Id,
								IsDebit = true
						});


						var crBal = await _bal.UpdateCrAccount(item);
						crBal.ToList().ForEach(bal =>
												balances[bal.Id] = bal);
						var drBal = await _bal.UpdateDrAccount(item);
						drBal.ToList().ForEach(bal =>
												balances[bal.Id] = bal);
						var bal = await _monthly.AddToMonthlyTransaction(item, false, false);


						for (int i = 0; i < item.Notifications.Count(); i++)
						{
								var notif = item.Notifications[i];
								HookMessage? hook = await _hooks.GetOneHook(Guid.Parse(notif));
								if (hook != null)
								{
										hook.TransactionId = item.Id;
										hook.TimeToLive = -1;
										await _hooks.SaveHook(hook, false);
										response.Notifications.Add(hook);
								}
						}


						response.Accounts = accounts.Values.ToList();
						response.Balances = balances.Values.ToList();
						response.Monthly = new[] { bal }.ToList();

						Transaction? result = _repo.CreateTransaction(item);

						if (result == null)
						{
								//transaction.Rollback();
								throw new Exception("BadRequest");
						}
						//transaction.Commit();

						response.Transaction = result;

						if (dto.ScheduleId.HasValue)
						{
								response.Schedule = await _schedules.ApplyScheduledTransaction(response.Transaction);
						}
						await _audit.UpdateStatus(200, response);
						return response;
				}


				[Function("UpdateTransactions")]
				public async Task<IActionResult> UpdateOne([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "transactions/{id}")]
				HttpRequest req, Guid id)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();




						await _audit.AddFromRequest(req);
						var dto = await req.ReadFromJsonAsync<CreateTransactionDto>();

						Transaction? transaction = _repo.GetOneTransaction(id);
						if (transaction == null) return new NotFoundResult();


						NewTransactionResponseDto response = new NewTransactionResponseDto();
						Dictionary<Guid, Account> accounts = new Dictionary<Guid, Account>();
						Dictionary<string, AccountBalance> balances = new Dictionary<string, AccountBalance>();
						Dictionary<string, MonthlyTransaction> monthly = new Dictionary<string, MonthlyTransaction>();

						var creditAcctOfNew = _account.GetOne(dto.CreditId);
						if (creditAcctOfNew == null)
						{
								_logger.LogError("dto.CreditId is not a valid AccountId");
								return new BadRequestResult();
						}
						

						var debitAcctOfNew = _account.GetOne(dto.DebitId);
						if (debitAcctOfNew == null)
						{
								_logger.LogError("dto.DebitId is not a valid AccountId");
								return new BadRequestResult();
						}



						accounts[transaction.CreditId] = _account.UpdateCreditAcct(transaction.CreditId, -transaction.Amount);
						accounts[transaction.DebitId] = _account.UpdateDebitAcct(transaction.DebitId, -transaction.Amount);

						var revCr = await _bal.UpdateCrAccount(transaction, true, false);
						revCr.ToList().ForEach(bal =>
																		balances[bal.Id] = bal);
						var revDr = await _bal.UpdateDrAccount(transaction, true, false);
						revDr.ToList().ForEach(bal =>
																		balances[bal.Id] = bal);

						var bal = await _monthly.AddToMonthlyTransaction(transaction, false, true);
						monthly[bal.MonthKey] = bal;

						_mapper.Map(dto, transaction);
						var creditBal = await _bal.CreateBalances(creditAcctOfNew, dto.Date, false);
						accounts[dto.CreditId] = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
						 
						if (creditBal == null)
						{
								throw new Exception($"creditbal was null for some reason: creditId:{dto.CreditId}, date:{dto.Date.ToString("yyyy-MM")}, transactionId: {dto.Id}");
						}

						transaction.BalanceRefs.Clear();
						transaction.BalanceRefs.Add(new BalanceAccount
						{
								AccountId = dto.CreditId,
								AccountBalanceKey = creditBal.Id,
								IsDebit = false
						});

						var debitBal = await _bal.CreateBalances(debitAcctOfNew, dto.Date, false);  
						accounts[dto.DebitId] = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);

						if (debitBal == null)
						{
								throw new Exception($"debitBal was null for some reason: DebitId:{dto.DebitId}, date:{dto.Date.ToString("yyyy-MM")}, transactionId: {dto.Id}");
						}
						transaction.BalanceRefs.Add(new BalanceAccount
						{
								AccountId = dto.DebitId,
								AccountBalanceKey = debitBal.Id,
								IsDebit = true
						});

						var crBal = await _bal.UpdateCrAccount(transaction, save: false);
						crBal.ToList().ForEach(bal =>
								balances[bal.Id] = bal);
						var drBal = await _bal.UpdateDrAccount(transaction, save: false);
						drBal.ToList().ForEach(bal =>
								balances[bal.Id] = bal);

						var bal2 = await _monthly.AddToMonthlyTransaction(transaction, save: false, remove: false);
						monthly[bal2.MonthKey] = bal2;


						transaction.MonthKey = bal2.MonthKey;

						response.Accounts = accounts.Values.ToList();
						response.Balances = balances.Values.ToList();
						response.Monthly = monthly.Values.ToList();

						transaction.DateAdded = DateTime.UtcNow;
						 Transaction result = _repo.UpdateTransaction(transaction);
						if (result == null)
						{
								//trans.Rollback();
								return new BadRequestResult();
						}
						//_pConf.LastTransactionId = result.Id.ToString();
						response.Transaction = result;
						await _audit.UpdateStatus(200, response);

						return await Task.FromResult(new OkObjectResult(response));
				}

				[Function("GetTransactions")]
				public async Task<IActionResult> GetByMonth([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "transactions")] 
				HttpRequest req)
				{
						if (!_user.IsAuthenticated) return new UnauthorizedResult();
						if (!_user.IsAuthorized("finance_user")) return new ForbidResult();
						IEnumerable<Transaction> transactions = Array.Empty<Transaction>();
						if(req.Query.Any(e=>e.Key=="year") && req.Query.Any(e => e.Key== "month"))
						{
								var year = int.Parse(req.Query["year"]!);
								var month = int.Parse(req.Query["month"]!); 
								
								transactions = _repo.GetByMonth(year, month);
						}
						else
						{
								var year = int.Parse(req.Query["after"]!);
						}
            return await Task.FromResult(new OkObjectResult(transactions));
				}


		}
}
