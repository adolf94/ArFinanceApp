﻿using Newtonsoft.Json;
using TypeLite;

namespace FinanceProject.Models
{
		public class Account
		{
				public Guid Id { get; set; } = new Guid();
				public string? Name { get; set; }
				public bool Enabled { get; set; }
				public Guid? AccountGroupId { get; set; }
				public AccountGroup? AccountGroup { get; set; }
				public decimal ForeignExchange { get; set; }
				public decimal Balance { get; set; }
				public decimal CurrBalance { get; set; }


				[JsonIgnore]
				public virtual ICollection<Transaction>? TransactionsAsDebit { get; set; }
				[JsonIgnore]
				public virtual ICollection<Transaction>? TransactionsAsCredit { get; set; }
		}
}