﻿using Microsoft.EntityFrameworkCore;

namespace FinanceProject.Models
{
		public class Vendor
		{
				public Guid Id { get; set; } = new Guid();

				public string? Name { get; set; }
				public Guid AccountTypeId { get; set; }
				public AccountType? AccountType { get; set; }
				public bool Enabled { get; set; }




		}
}
