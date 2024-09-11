namespace FinanceApp.Utilities
{
		public static class Ext
		{
				public static string TrimStartC(this string target, string trimString)
				{
						if (string.IsNullOrEmpty(trimString)) return target;

						string result = target;
						while (result.StartsWith(trimString))
						{
								result = result.Substring(trimString.Length);
						}

						return result;
				}
		}
}
