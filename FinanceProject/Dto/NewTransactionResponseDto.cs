using FinanceProject.Models;

namespace FinanceProject.Dto
{
		public class NewTransactionResponseDto
		{
				public ICollection<Transaction>? transactions{ get; set; }
				
				public IEnumerable<Account>? accounts { get; set; }
		}
}
