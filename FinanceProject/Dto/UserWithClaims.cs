namespace FinanceApp.Dto
{
		public class GoogleClaimResponse
		{
				public string access_token { get; set; } = string.Empty;
				public string refresh_token { get; set; } = string.Empty;
				public string id_token { get; set; } = string.Empty;
				public int expires_in { get; set; } = 0;
				public string scope { get; set; } = string.Empty;
		}
}
