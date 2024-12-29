using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class Vendor
		{
				public Guid Id { get; set; } = new Guid();

				public string? Name { get; set; }
				public bool Enabled { get; set; }

				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";




		}
}
