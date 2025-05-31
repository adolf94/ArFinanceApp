namespace FinanceFunction.Dtos;

public class AccountCreateDto
{
    public string? Name { get; set; }
    public Guid? AccountGroupId { get; set; }
    public decimal ForeignExchange { get; set; }
    public decimal Balance { get; set; }
    public decimal CurrBalance { get; set; }
    public int PeriodStartDay { get; set; } = 1;
    public bool ResetEndOfPeriod { get; set; } = false;
				
				
    public DateTime MinMonth { get; set; }
    public DateTime MaxMonth { get; set; }
}