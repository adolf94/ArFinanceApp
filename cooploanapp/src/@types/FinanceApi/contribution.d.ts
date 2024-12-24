declare module 'FinanceApi' {
	
	public interface Contribution {
		id: string;
		forDate: string;
		date: string;
		dateAdded:string;
		amount: number;
		entryId?: string;
		index: number;
	}
	
}




						//
						// public Guid Id { get; set; } = Uuid.NewSequential();
						// public DateTime ForDate { get; set; }
						// public DateTime Date { get; set; }
						// public DateTime DateAdded { get; set; } = DateTime.Now;
						// public decimal Amount { get; set; }
						// public string EntryId { get; set; } = string.Empty;
						// public int Index { get; set; }