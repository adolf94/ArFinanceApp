using System;
using FinanceFunction.Data;
using FinanceFunction.Dtos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace FinanceFunction.Cronjobs;

public class ScheduleFunctionCron
{
		private readonly IScheduledTransactionRepo _repo;
		private readonly TransactionController _trc;
		private readonly ITransactionRepo _tr;
		private readonly ILogger _logger;

    public ScheduleFunctionCron(ILoggerFactory loggerFactory, IScheduledTransactionRepo repo, ITransactionRepo tr,
        TransactionController trc)
    {
        _repo = repo;
        _trc = trc;
        _tr = tr;
        _logger = loggerFactory.CreateLogger<ScheduleFunctionCron>();
    }

    [Function("ScheduleFunctionCron")]
    public async Task Run([TimerTrigger("0 30 8 * * *")] TimerInfo myTimer)
    {

        var dues = await _repo.GetPendingTransactions();

        for (int i = 0; i < dues.Count(); i++)
        {
            var item = dues[i];
            if (!item.LastTransactionId.HasValue) continue;
            var last_transaction = _tr.GetOneTransaction(item.LastTransactionId!.Value);

            if(last_transaction == null)
                continue;




            var new_transaction = new CreateTransactionDto
            {
               Date = item.NextTransactionDate,
               Id = UUIDNext.Uuid.NewSequential(),
               CreditId = last_transaction!.CreditId,
               DebitId = last_transaction.DebitId,
               VendorId = last_transaction.VendorId,
               Amount = last_transaction.Amount,
               Type = last_transaction.Type,
               ScheduleId = last_transaction.ScheduleId,
               Description = $"Installment {item.LastTransactionIndex + 1} of {item.Iterations}\n${item.Description}"
            };

            await _trc.CreateOneTransaction(new_transaction);



        }

        _logger.LogInformation("C# Timer trigger function executed at: {executionTime}", DateTime.Now);
        
        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next timer schedule at: {nextSchedule}", myTimer.ScheduleStatus.Next);
        }
    }
}