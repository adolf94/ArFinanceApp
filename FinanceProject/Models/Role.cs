using System.ComponentModel.DataAnnotations;

namespace FinanceProject.Models
{
		public class Role
		{
        public required string RoleName { get; set; } 
        
        [MaxLength(100)]
        public string PartitionKey { get; init; } = "default";

    }
}