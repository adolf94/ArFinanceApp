﻿using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class CreateTransactionDto
		{
        public Guid Id { get; set; }
        public Guid CreditId { get; set; }
        public Guid? VendorId { get; set; }
				public Guid DebitId { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string type { get; set; }

				public string Description { get; set; } = string.Empty;
		}
}
