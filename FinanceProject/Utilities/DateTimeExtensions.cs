namespace FinanceApp.Utilities
{
		public static class DateTimeExtensions
		{
				public static string ToDateOnlyString(this DateTime dateTime)
				{
						return dateTime.ToString("yyyy-MM-dd");
				}

				public static long ToEpoch(this DateTime dateTime)
				{
						return (long)dateTime.Subtract(DateTime.UnixEpoch).TotalSeconds;
				}
				public static DateTime FromEpoch(this DateTime dateTime, long seconds)
				{
						return DateTime.UnixEpoch.AddSeconds(seconds);
				}


		}
}
