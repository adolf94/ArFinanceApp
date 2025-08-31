using FinanceFunction.Data;
using FinanceFunction.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Data.CosmosRepo
{
    public class AccountBalanceRepo : IAccountBalanceRepo
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AccountBalanceRepo> _logger;

        public AccountBalanceRepo(AppDbContext context, IMemoryCache cache, ILogger<AccountBalanceRepo> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        public async Task<AccountBalance?> GetOne(Account acct, DateTime date)
        {
            if (acct.MaxMonth < date || acct.MinMonth > date)
            {
                return new AccountBalance(date.Year, date.Month, acct.Id, acct.PeriodStartDay)
                {
                    Balance = acct.MinMonth > date ? 0 : acct.Balance,
                    EndingBalance = acct.MinMonth > date ? 0 : acct.Balance,
                    Account = acct,
                    PartitionKey = "default",
                    Transactions = new List<AccountBalance.BalanceTransaction>()
                };
            }
            else
            {
                var item = await _context.AccountBalances!.Where(e => e.Id == $"{date.Year}|{date.Month:D2}|{acct.Id}")
                    .FirstOrDefaultAsync();
                return item;
            }
        }







        public async Task<AccountBalance> CreateBalances(Account acct, DateTime month, bool save = true)

        {
            DateTime currentPeriod = new DateTime(month.Year, month.Month, 1);
            DateTime prevPeriod = new DateTime(month.Year, month.Month, 1).AddMonths(-1);
            bool isPrevPeriod = acct.PeriodStartDay >= month.Day;



            List<AccountBalance> balancesToAdd = new List<AccountBalance>();
            if (prevPeriod < acct.MinMonth)
            {
                //Create account balanced previous months
                DateTime period = acct.MinMonth.AddMonths(-1);
                while (period >= prevPeriod)
                {
                    var newBalance = new AccountBalance(period.Year, period.Month, acct.Id, acct.PeriodStartDay);
                    balancesToAdd.Add(newBalance);
                    acct.MinMonth = period;
                    period = period.AddMonths(-1);
										await _context.AccountBalances!.AddAsync(newBalance);
										if (save) await _context.SaveChangesAsync();

								}
						}

						string balanceKey = isPrevPeriod ? $"{prevPeriod.Year}|{prevPeriod.Month:D2}|{acct.Id}"
														: $"{currentPeriod.Year}|{currentPeriod.Month:D2}|{acct.Id}";



						if (currentPeriod > acct.MaxMonth)
            {

                DateTime period = acct.MaxMonth.AddMonths(1);
                while (period <= currentPeriod)
                {
                    //check acctBalance before insert?
                    var newBalance = new AccountBalance(period.Year, period.Month, acct.Id, acct.PeriodStartDay)
                    {
                        Balance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
                        EndingBalance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
                    };
                    balancesToAdd.Add(newBalance);
                    acct.MaxMonth = period;
										await _context.AccountBalances!.AddAsync(newBalance);
										if (save) await _context.SaveChangesAsync();
										period = period.AddMonths(1);

                }
            }


						var item = await _context.AccountBalances!.FindAsync(balanceKey);


            return item!;
				}



        public async Task<IEnumerable<AccountBalance>> UpdateCrAccount(Transaction transaction,  bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == transaction.CreditId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();


            AccountBalance bal = await CreateBalances(acct, transaction.Date);

            if (reverse)
						{
								bal.EndingBalance += transaction.Amount;
								bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction.Id).ToList();
            }
            else
						{
								bal.EndingBalance -= transaction.Amount;
								bal.Transactions.Add(new AccountBalance.BalanceTransaction()
                {
                    TransactionId = transaction.Id,
                    Amount = -transaction.Amount,
                    EpochUpdated = transaction.EpochUpdated
                });
            }

            balance.Add(bal);
            if (!acct.ResetEndOfPeriod)
            {
                var balances = await _context.AccountBalances!.Where(e => e.AccountId == transaction.CreditId && e.DateStart > transaction.Date)
                    .Select(e=>e.Id)
                    .ToListAsync();

                for(var i = 0; i<balances.Count(); i++)
								{
										var b = await _context.AccountBalances!.FindAsync(balances[i]);
										b.Balance += transaction.Amount * (reverse ? 1 : -1);
										b.EndingBalance += transaction.Amount * (reverse ? 1 : -1);

										balance.Add(b);
								}

            }
             
            if (save) await _context.SaveChangesAsync();
            return balance;
        }

        public async Task<IEnumerable<AccountBalance>> UpdateDrAccount(Transaction transaction, bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == transaction.DebitId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();

            AccountBalance bal = await CreateBalances(acct, transaction.Date)!;

            if (reverse)
						{
								bal.EndingBalance -= transaction.Amount;
								bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction.Id).ToList();
            }
            else
						{
								bal.EndingBalance += transaction.Amount;
								bal.Transactions.Add(new AccountBalance.BalanceTransaction()
                {
                    TransactionId = transaction.Id,
                    Amount = +transaction.Amount,
                    EpochUpdated = transaction.EpochUpdated
                });
            }
            balance.Add(bal); 
            if (!acct.ResetEndOfPeriod)
            {
                var balances = await _context.AccountBalances!.Where(e => e.AccountId == transaction.DebitId && e.DateStart > transaction.Date)
                    .ToListAsync();


								for (int i = 0; i < balances.Count; i++)
								{
										var b = await _context.AccountBalances!.FindAsync(balances[i].Id)!;
										b.Balance += transaction.Amount * (reverse ? -1 : 1);
										b.EndingBalance += transaction.Amount * (reverse ? -1 : 1);
										balance.Add(b);
								}

            }

            if (save) await _context.SaveChangesAsync();

            return balance;
        }

        public AccountBalance? GetByAccountWithDate(Guid account, DateTime date)
        {


            throw new NotImplementedException();


        }



        public Task<IQueryable<AccountBalance>> GetByDate(DateTime date)
        {
            return Task.FromResult( _context.AccountBalances!.Where(e => e.DateStart == date));
            //TODO -- logic for Credit cards 
        }

        public IQueryable<AccountBalance> GetByDateCredit(DateTime date)
        { 
            throw new NotImplementedException();
        }

				public async Task<IQueryable<AccountBalance>> GetAll()
				{
            return await Task.FromResult(_context.AccountBalances!);
				}
		}
}
