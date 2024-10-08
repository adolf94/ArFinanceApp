﻿using Newtonsoft.Json;

namespace FinanceProject.Models
{
		public class User
		{
				public Guid Id { get; set; } = new Guid();

				public string? UserName { get; set; }
				public string? Name { get; set; }
				public string? AzureId { get; set; }

				public string MobileNumber { get; set; } = string.Empty;

				public string EmailAddress { get; set; } = string.Empty;

				public string[] Roles { get; set; } = Array.Empty<string>() ;

        [JsonIgnore]
				public ICollection<Transaction>? Transactions { get; set; }
		}
}
