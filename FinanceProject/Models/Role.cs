namespace FinanceProject.Models
{
		public class Role
		{
        public required string RoleName { get; set; } 
        public string PartitionKey { get; } = "default";

    }
}