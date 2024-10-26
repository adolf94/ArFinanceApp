namespace FinanceApp.Models
{
		public class MemberProfile
		{
				public string AppId { get; set; }
				public int Year { get; set; }
				public Guid UserId { get; set; }

				public decimal InitialAmount { get; set; }
				public decimal Increments { get; set; }
				public decimal NoOfParts { get; set; }

		}
}
