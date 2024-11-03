namespace FinanceApp.Models
{
		public class MemberProfile
		{
				public string AppId { get; set; }
				public int Year { get; set; }
				public Guid UserId { get; set; }

				public decimal InitialAmount { get; set; }
				public decimal Increments { get; set; }
				public int Shares { get; set; }
				public int InstallmentCount { get; set; }
				public DateTime FirstInstallment { get; set; }

				public List<Contribution> Contributions { get; set; } = new List<Contribution>();


				public class Contribution
				{
						public DateTime ForDate { get; set; }
						public DateTime Date { get; set; }
						public DateTime DateAdded { get; set; } = DateTime.Now;
						public decimal Amount { get; set; }
						public int Index { get; set; }
				}
		}
}
