﻿using System.Text.Json.Serialization;

namespace FinanceApp.Models
{
		public class LoanPayment
		{
				public string Id
				{
						get
						{
								return PaymentId.ToString() + "|" + LoanId.ToString() + "|" + (AgainstPrincipal ? "principal" : "interest");
						}
				}
        public DateTime Date { get; set; }
        public Guid PaymentId { get; set; }
				[JsonIgnore]
				public PaymentRecord Payment { get; set; }
				public Guid LoanId { get; set; }
				[JsonIgnore]
				public Loans Loan { get; set; }
				public string AppId { get; set; }
				public Guid UserId { get; set; }
				public decimal Amount { get; set; }
				public bool AgainstPrincipal { get; set; }
		}
}