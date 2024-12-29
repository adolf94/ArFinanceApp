using System.ComponentModel.DataAnnotations;
using UUIDNext;

namespace FinanceApp.Models
{
		public class MemberProfile
		{
				public string AppId { get; set; }
				public int Year { get; set; }
				public Guid UserId { get; set; }
				public Guid Id { get; set; } = Uuid.NewSequential();

				public decimal InitialAmount { get; set; }
				public decimal Increments { get; set; }
				public int Shares { get; set; }
				public int InstallmentCount { get; set; }
				public DateTime FirstInstallment { get; set; }

				public List<Contribution> Contributions { get; set; } = new List<Contribution>();
				
				[MaxLength(100)]
				public string PartitionKey { get; init; } = "default";



				public class Contribution
				{

						public Guid Id { get; set; } = Uuid.NewSequential();
						public DateTime ForDate { get; set; }
						public DateTime Date { get; set; }
						public DateTime DateAdded { get; set; } = DateTime.Now;
						public decimal Amount { get; set; }
						public Guid EntryId { get; set; } 
						public int Index { get; set; }
				}
		}
}
