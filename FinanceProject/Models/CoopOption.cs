namespace FinanceApp.Models
{
		public class CoopOption
		{
				public string AppId { get; set; }
				public int Year { get; set; }
				public decimal InitialAmount { get; set; }
				public DateTime FirstInstallment { get; set; }
				public CoopOptionFrequency Frequency { get; set; } = FrequencyOptions.TwicePerMonth;
				public decimal Increments { get; set; }
				public int InstallmentCount { get; set; }

		}

		public static class FrequencyOptions
		{
				public static CoopOptionFrequency Monthly = new CoopOptionFrequency { Name = "Monthly", Cron = "0 0 DD * *" };
				public static CoopOptionFrequency TwicePerMonth = new CoopOptionFrequency { Name = "Twice per month(15,LastDay)", Cron = "0 0 15,[L] * *" };
				public static CoopOptionFrequency Weekly = new CoopOptionFrequency { Name = "Weekly", Cron = "0 0 0 * * d" };
		}

		public class CoopOptionFrequency
		{
				public string Name { get; set; } = "";
				public string Cron { get; set; } = "";
		}
}
