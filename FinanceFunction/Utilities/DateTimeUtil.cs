using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Utilities
{
		public static class DateTimeUtil 
		{

				public static DateTime ToMnlTime(this DateTime date)
				{
						TimeZoneInfo philippinesTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Singapore Standard Time");

						// 3. Convert UTC time to Philippines time
						DateTime philippinesTime = TimeZoneInfo.ConvertTimeFromUtc(date, philippinesTimeZone);
						return philippinesTime;
				}

		}
}
