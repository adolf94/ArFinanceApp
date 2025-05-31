using FinanceFunction.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FinanceFunction.Utilities
{
		public static class FnConfigToAppConfig
		{
				public static AppConfig  PrepareConfig()
				{
						return new AppConfig()
						{
								jwtConfig = {
										secret_key = GetEnv("JwtConfig_SecretKey")!,
										audience = GetEnv("JwtConfig_Audience"),
										issuer = GetEnv("JwtConfig_Issuer")
								},
								authConfig =
								{
										client_secret = GetEnv("Google_ClientSecret"),
										client_id =  GetEnv("Google_ClientId"),
										redirect_uri =  GetEnv("Google_RedirectUri"),
										scope =  GetEnv("Google_Scope")

								},
								FinanceHook = {
										Key =  GetEnv("FinanceHook_Key"),
										HookUrl =  GetEnv("FinanceHook_HookUrl"),
								},
								PersistDb = GetEnv("FinanceHook_PersistDb")
						};
				}
				private static string GetEnv(string env)
				{
						return Environment.GetEnvironmentVariable(env) ?? "";
				}
		}
}
