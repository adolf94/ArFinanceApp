﻿using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class ScheduledTransactions
		{
				[Key]
				public Guid Id { get; set; }
				public string CronExpression { get; set; } = string.Empty;
				public string CronId { get; set; } = string.Empty;
				public DateTime DateCreated { get; set; } = DateTime.UtcNow;

				public int TotalOccurence { get; set; }

				public DateTime EndDate { get; set; }

				public DateTime LastTransactionDate { get; set; }
				public int LastTransactionIndex { get; set; }
				public DateTime NextTransactionDate { get; set; }
				public bool Enabled { get; set; } = true;


				public Guid? LastTransactionId { get; set; }
				public Transaction? LastTransaction { get; set; }
		}
}
