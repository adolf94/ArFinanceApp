namespace FinanceFunction.Models.SubModels;

public class LedgerEntryTransaction
{
	public string  Type { get; set; }
	public Guid TransactionId { get; set; }
	
	
}

public static class  EntryTransactionTypes
{
	public static readonly string Loan = "loan";
	public static readonly  string Interest = "interest";
	public static readonly string Payment = "payment";
	public static readonly string Contribution = "contribution";
}