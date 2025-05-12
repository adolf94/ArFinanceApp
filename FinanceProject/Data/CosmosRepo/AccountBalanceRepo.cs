using FinanceProject.Data;
using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FinanceApp.Data.CosmosRepo
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
                }
            }

            if (currentPeriod > acct.MaxMonth)
            {

                DateTime period = acct.MaxMonth.AddMonths(1);
                while (period <= currentPeriod)
                {
                    var newBalance = new AccountBalance(period.Year, period.Month, acct.Id, acct.PeriodStartDay)
                    {
                        Balance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
                        EndingBalance = acct.ResetEndOfPeriod ? 0 : acct.Balance,
                    };
                    balancesToAdd.Add(newBalance);
                    acct.MaxMonth = period;
                    period = period.AddMonths(1);
                }
            }

            if (balancesToAdd.Any())
            {
                await _context.AccountBalances!.AddRangeAsync(balancesToAdd);
                if (save) await _context.SaveChangesAsync();
            }

            string balanceKey = isPrevPeriod ? $"{prevPeriod.Year}|{prevPeriod.Month:D2}|{acct.Id}"
                            : $"{currentPeriod.Year}|{currentPeriod.Month:D2}|{acct.Id}";


            var item = await _context.AccountBalances!.FirstOrDefaultAsync(e =>
                e.Id == balanceKey);

            return item!;

        }



        public async Task<IEnumerable<AccountBalance>> UpdateCrAccount(Transaction transaction,  bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == transaction.CreditId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();


            AccountBalance bal = await CreateBalances(acct, transaction.Date);
            bal.EndingBalance -= transaction.Amount;

            if (reverse)
            {
                bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction.Id).ToList();
            }
            else
            {
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
                    .ToListAsync();

                balance.AddRange(balances.Select(b =>
                {
                    b.Balance -= transaction.Amount;
                    b.EndingBalance -= transaction.Amount;
                    return b;
                }).ToArray());
            }

            if (save) await _context.SaveChangesAsync();
            return balance;
        }

        public async Task<IEnumerable<AccountBalance>> UpdateCrAccount(Guid creditId, decimal amount,
            Guid transaction, DateTime date, bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == creditId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();

            AccountBalance bal = await CreateBalances(acct, date);
            bal.EndingBalance -= amount;

            if (reverse)
            {
                bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction).ToList();
            }
            else
            {
                bal.Transactions.Add(new AccountBalance.BalanceTransaction()
                {
                    TransactionId = transaction,
                    Amount = -amount
                });
            }

            balance.Add(bal);
            if (!acct.ResetEndOfPeriod)
            {
                var balances = await _context.AccountBalances!.Where(e => e.AccountId == creditId && e.DateStart > date)
                    .ToListAsync();

                balance.AddRange(balances.Select(b =>
                {
                    b.Balance -= amount;
                    b.EndingBalance -= amount;
                    return b;
                }).ToArray());
            }

            if (save) await _context.SaveChangesAsync();
            return balance;

        }
        public async Task<IEnumerable<AccountBalance>> UpdateDrAccount(Transaction transaction, bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == transaction.DebitId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();

            AccountBalance bal = await CreateBalances(acct, transaction.Date);
            bal.EndingBalance += transaction.Amount;

            if (reverse)
            {
                bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction.Id).ToList();
            }
            else
            {
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

                balance.AddRange(balances.Select(b =>
                {
                    b.Balance += transaction.Amount;
                    b.EndingBalance += transaction.Amount;
                    return b;
                }).ToArray());
            }

            if (save) await _context.SaveChangesAsync();

            return balance;
        }
        public async Task<IEnumerable<AccountBalance>> UpdateDrAccount(Guid debitId, decimal amount,
            Guid transaction, DateTime date, bool reverse = false, bool save = true)
        {
            Account? acct = await _context.Accounts!.Where(e => e.Id == debitId).FirstOrDefaultAsync();
            if (acct == null) throw new Exception("Account not found");
            List<AccountBalance> balance = new List<AccountBalance>();

            AccountBalance bal = await CreateBalances(acct, date);
            bal.EndingBalance += amount;

            if (reverse)
            {
                bal.Transactions = bal.Transactions.Where(e => e.TransactionId != transaction).ToList();
            }
            else
            {
                bal.Transactions.Add(new AccountBalance.BalanceTransaction()
                {
                    TransactionId = transaction,
                    Amount = -amount
                });
            }
            balance.Add(bal);
            if (!acct.ResetEndOfPeriod)
            {
                var balances = await _context.AccountBalances!.Where(e => e.AccountId == debitId && e.DateStart > date)
                    .ToListAsync();

                balance.AddRange(balances.Select(b =>
                {
                    b.Balance += amount;
                    b.EndingBalance += amount;
                    return b;
                }).ToArray());
            }

            if (save) await _context.SaveChangesAsync();

            return balance;

        }



        public AccountBalance? GetByAccountWithDate(Guid account, DateTime date)
        {


            throw new NotImplementedException();


        }



        public IQueryable<AccountBalance> GetByDate(DateTime date)
        {
            throw new NotImplementedException();
            //TODO -- logic for Credit cards 
        }

        public IQueryable<AccountBalance> GetByDateCredit(DateTime date)
        {
            throw new NotImplementedException();
        }
    }
}
