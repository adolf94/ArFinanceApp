namespace FinanceProject.Models
{
		public class AppConfig
		{
				public string CosmosEndpoint { get; set; } = string.Empty;
				public string CosmosKey { get; set; } = string.Empty;

				public GoogleConfig authConfig { get; set; } = new();
				public AppJwtConfig jwtConfig { get; set; } = new();

				public class GoogleConfig
				{
						public string client_id { get; set; } = "";
						public string client_secret { get; set; } = "";
						public string scope { get; set; } = "";
						public string redirect_uri { get; set; } = "";
				}
				public class AppJwtConfig
				{
						public string issuer { get; set; } = "";
						public string audience { get; set; } = "";
						public string secret_key { get; set; } = "";
				}
		}

}
