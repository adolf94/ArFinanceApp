namespace FinanceProject.Models
{
		public class AppConfig
		{
				public string CosmosEndpoint { get; set; } = string.Empty;
				public string CosmosKey { get; set; } = string.Empty;
				public string DataImplementation { get; set; } = "";
				public GoogleConfig authConfig { get; set; } = new();
				public AppJwtConfig jwtConfig { get; set; } = new();
        public SmsConfiguration SmsConfig { get; set; }
        public IEnumerable<AppRedirects> RedirectUrl { get; set; } = Array.Empty<AppRedirects>();

				public class GoogleConfig
				{
						public string client_id { get; set; } = "";
						public string client_secret { get; set; } = "";
						public string scope { get; set; } = "";
				}
				public class AppRedirects
				{
						public string App { get; set; } = string.Empty;
            public string redirect_uri { get; set; } = string.Empty;
				}
				public class SmsConfiguration
				{

						public string Endpoint { get; set; } = string.Empty;
						public string Username { get; set; } = string.Empty;
						public string Password { get; set; } = string.Empty;
						public bool Enabled { get; set; } = false;
						public bool Encrypt { get; set; } = false;
        }
        public class AppJwtConfig
				{
						public string issuer { get; set; } = "";
						public string audience { get; set; } = "";
						public string secret_key { get; set; } = "";
				}
		}

}
