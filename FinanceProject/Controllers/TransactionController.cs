﻿using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceApp.Models;
using FinanceProject.Data;
using FinanceProject.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceProject.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize(Roles = "FINANCE_USER")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionRepo _repo;
        private readonly IAccountRepo _account;
        private readonly IAccountBalanceRepo _bal;
        private readonly IMapper _mapper;
        private PersistentConfig _pConf;
        private readonly ILogger<TransactionController> _logger;
        private readonly IMonthlyTransactionRepo _monthly;
        private readonly IHookMessagesRepo _hooks;

        public TransactionController(ITransactionRepo repo, IAccountRepo account, IAccountBalanceRepo bal, IMonthlyTransactionRepo monthly,
            PersistentConfig pConfig, IMapper mapper, ILogger<TransactionController> logger, IHookMessagesRepo hooks)
        {
            _repo = repo;
            _account = account;
            _bal = bal;
            _mapper = mapper;
            _pConf = pConfig;
            _logger = logger;
            _monthly = monthly;
            _hooks = hooks; 
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

            Transaction item = _mapper.Map<Transaction>(dto);

            //to do -- add try catch with rollback transactions
            var AcctCredit = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
            var creditBal = await _bal.CreateBalances(AcctCredit, dto.Date);
            accounts[dto.CreditId] = AcctCredit;
            item.BalanceRefs.Add(new BalanceAccount
            {
                AccountId = dto.CreditId,
                AccountBalanceKey = creditBal.Id,
                IsDebit = false
            });


            var accDebit = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);
            accounts[dto.DebitId] = accDebit;
            var debitBal = await _bal.CreateBalances(accDebit, dto.Date);
            item.BalanceRefs.Add(new BalanceAccount
            {
                AccountId = dto.DebitId,
                AccountBalanceKey = debitBal.Id,
                IsDebit = true
            });


            var crBal = await _bal.UpdateCrAccount(item);
            crBal.ToList().ForEach(bal =>
                        balances[bal.Id] = bal);
            var drBal = await _bal.UpdateDrAccount(item);
            drBal.ToList().ForEach(bal =>
                        balances[bal.Id] = bal);
            var bal = await _monthly.AddToMonthlyTransaction(item, false,false);


            for (int i = 0; i<item.Notifications.Count(); i++)
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
            response.Monthly = new [] { bal }.ToList();

            Transaction? result = _repo.CreateTransaction(item);

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
            Dictionary<string, MonthlyTransaction> monthly = new Dictionary<string, MonthlyTransaction>();



            accounts[transaction.CreditId] = _account.UpdateCreditAcct(transaction.CreditId, -transaction.Amount);
            accounts[transaction.DebitId] = _account.UpdateDebitAcct(transaction.DebitId, -transaction.Amount);

            var revCr = await _bal.UpdateCrAccount(transaction, true, false);
            revCr.ToList().ForEach(bal =>
                                    balances[bal.Id] = bal);
            var revDr = await _bal.UpdateDrAccount(transaction, true, false);
            revDr.ToList().ForEach(bal =>
                                    balances[bal.Id] = bal);

            var bal = await _monthly.AddToMonthlyTransaction(transaction, false,true);
            monthly[bal.MonthKey] = bal;

            _mapper.Map(dto, transaction);
            accounts[dto.CreditId] = _account.UpdateCreditAcct(dto.CreditId, dto.Amount);
            var creditBal = await _bal.CreateBalances(accounts[dto.CreditId], dto.Date, false);
            transaction.BalanceRefs.Clear();
            transaction.BalanceRefs.Add(new BalanceAccount
            {
                AccountId = dto.CreditId,
                AccountBalanceKey = creditBal.Id,
                IsDebit = false
            });

            accounts[dto.DebitId] = _account.UpdateDebitAcct(dto.DebitId, dto.Amount);
            var debitBal = await _bal.CreateBalances(accounts[dto.DebitId], dto.Date, false);

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

            var bal2 = await _monthly.AddToMonthlyTransaction(transaction, save:false, remove: false);
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
                return BadRequest();
            }
            _pConf.LastTransactionId = result.Id.ToString();
            response.Transaction = result;

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
            //			});


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
