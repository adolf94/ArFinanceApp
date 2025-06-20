﻿using System.ComponentModel.DataAnnotations;
using FinanceFunction.Models;
using FinanceFunction.Models.SubModels;
using Newtonsoft.Json;

namespace FinanceFunction.Models
{
		public class User
		{
				public Guid Id { get; set; } =Guid.NewGuid();

				public string? UserName { get; set; }
				public string? Name { get; set; }
				public string? AzureId { get; set; }

				public string MobileNumber { get; set; } = string.Empty;

				public string EmailAddress { get; set; } = string.Empty;

				public string[] Roles { get; set; } = Array.Empty<string>();
				public bool HasActiveLoans { get; set; } = false;
				public List<DisbursementAccount> DisbursementAccounts { get; set; } = new List<DisbursementAccount>();
				public LoanProfile? LoanProfile { get; set; } = null;
				public string GoogleName { get; set; } = "";
				public Guid? AcctReceivableId { get; set; }
				public Guid? LiabilitiesId { get; set; }
				public Guid? AcctEquityId { get; set; }
				
				
				[JsonIgnore]
				public ICollection<Transaction>? Transactions { get; set; }
				
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";
				
		}
}
