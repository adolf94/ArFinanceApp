using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using static FinanceProject.Models.AppConfig;

namespace FinanceApp.Controllers
{
		[Route("api/google")]
		[ApiController]
		public class GoogleController : ControllerBase
		{
				private readonly AppConfig _config;
				private readonly IUserRepo _user;
				private readonly ILogger<GoogleController> _logger;
				private IMemoryCache _cache;
				public GoogleController(AppConfig config, IUserRepo user, ILogger<GoogleController> logger, IMemoryCache cache)
				{
						_config = config;
						_user = user;
						_logger = logger;
						_cache = cache;
				}

				[HttpPost("auth")]
				public async Task<IActionResult> GetGoogleToken([FromBody] RequestTokenBody tokenBody)
				{
						HttpClient client = new HttpClient();

						var data = new Dictionary<string, string>();

						//get redirect 
						Application? app = _config.Apps.FirstOrDefault(e => e.App == tokenBody.App);

						if (app == null)
						{
								_logger.LogError("Invalid App Provided: " + tokenBody.App);

								HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid App Text";
								return Forbid();

						}

						string clientSecret = _cache.Get<string>("gclientsecret") ?? string.Empty;
						
						
						data.Add("client_id", _config.authConfig.client_id);
						data.Add("client_secret", clientSecret);
						data.Add("scope", _config.authConfig.scope);
						data.Add("redirect_uri", app.RedirectUri);
						data.Add("grant_type", "authorization_code");
						data.Add("code", tokenBody.Code);
						FormUrlEncodedContent content = new FormUrlEncodedContent(data);
						HttpResponseMessage resp = await client.PostAsync("https://oauth2.googleapis.com/token", content);
						string result = await resp.Content.ReadAsStringAsync();
						if (!resp.IsSuccessStatusCode)
						{
								Dictionary<string, string> error = JsonSerializer.Deserialize<Dictionary<string, string>>(result);

								if (error == null)
								{
										_logger.LogError("No Error result found for Google Auth");
										return StatusCode(500, result);
								}
								if (!error.ContainsKey("error"))
								{
										_logger.LogError("No Error KEY found for Google Auth");
										_logger.LogError(result);
										return StatusCode(500, result);
								}

								switch (error["error"])
								{
										case "redirect_uri_mismatch":
												_logger.LogError("Misconfiguration : REDIRECT URL MISMATCH");
												return StatusCode(500);
										case "invalid_client":
												_logger.LogError("Misconfiguration : INVALID CLIENT");
												return StatusCode(500);
										case "invalid_grant":
												HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid Code Key";
												return Unauthorized();
										default:
												_logger.LogError("Uncaught Error : " + error["error"]);
												return StatusCode(500);
								}
						}
						int tokenLifetime = 300;
						GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);
						if (string.IsNullOrEmpty(currentToken!.refresh_token))
						{
								_logger.LogWarning("No refresh token was received!");
								tokenLifetime = 60;
						}

						//byte[] byteData = Convert.FromBase64String(currentToken!.id_token.Split(".")[1]);

						var handler = new JwtSecurityTokenHandler();
						var idToken = handler.ReadJwtToken(currentToken!.id_token);

						//string decodedString = System.Text.Encoding.UTF8.GetString(byteData);Token

						//Dictionary<string, string>? gClaims = JsonSerializer.Deserialize<Dictionary<string, string>>(decodedString);

						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);

						List<Claim> claims = new List<Claim>();
						string[] claimsToCopy = new[] { "sub", "email", "nane", "azp" };
						claims = idToken.Claims.Where(e => claimsToCopy.Contains(e.Type)).ToList();
						List<Claim> idClaims = idToken.Claims.ToList();
						Claim? emailClaim = claims.FirstOrDefault(e => e.Type == "email");
						if (emailClaim == null)
						{
								_logger.LogError("Google Error? : No consent for email");

								return StatusCode(500);
						}

						User? user = await _user.GetByEmailAsync(emailClaim!.Value)!;


						if (user != null)
						{
								claims.Add(new Claim("userId", user!.Id.ToString()));
								claims.Add(new Claim("app", tokenBody.App));
								claims.Add(new Claim("type", "access_token"));

								idClaims.Add(new Claim("userId", user!.Id.ToString()));
								idClaims.Add(new Claim(ClaimTypes.Name, user.Name));
								idClaims.Add(new Claim("type", "id_token"));
									
								claims.Add(new Claim(ClaimTypes.Role, "Registered"));								idClaims.Add(new Claim(ClaimTypes.Name, user.Name));
								idClaims.Add(new Claim(ClaimTypes.Role, "Registered"));

								user.Roles.ToList().ForEach(e =>
								{
									idClaims.Add(new Claim(ClaimTypes.Role, e));

									claims.Add(new Claim(ClaimTypes.Role, e));
								});
								HttpContext.User.AddIdentity( new ClaimsIdentity(claims));
						}
						else
						{
								_logger.LogInformation($"{emailClaim!.Value} has no linked user");
								claims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
								idClaims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
						}





						//foreach (var item in gClaims!)
						//{
						//		claims.Add(new Claim(item.Key, item.Value));
						//}
						var accessDescriptor = new SecurityTokenDescriptor
						{
								Subject = new ClaimsIdentity(claims.Where(e => e.Type != "aud")),
								Expires = DateTime.UtcNow.AddMinutes(tokenLifetime),
								Issuer = _config.jwtConfig.issuer,
								Audience = _config.jwtConfig.audience,
								SigningCredentials = new SigningCredentials
								(new SymmetricSecurityKey(key),
								SecurityAlgorithms.HmacSha256)
						};


						var idDescriptor = new SecurityTokenDescriptor
						{
								Subject = new ClaimsIdentity(idClaims),
								Expires = DateTime.UtcNow.AddMinutes(tokenLifetime),
								Issuer = _config.jwtConfig.issuer,
								Audience = _config.jwtConfig.audience,
								SigningCredentials = new SigningCredentials
								(new SymmetricSecurityKey(key),
								SecurityAlgorithms.HmacSha256)
						};


						var tokenHandler = new JwtSecurityTokenHandler();
						var token = tokenHandler.CreateToken(accessDescriptor);
						var strClaimToken = tokenHandler.WriteToken(token);
						currentToken.access_token = strClaimToken;


						var idTokenNew = tokenHandler.CreateToken(idDescriptor);
						var strIdToken = tokenHandler.WriteToken(idTokenNew);
						currentToken.id_token = strIdToken;
						return await Task.FromResult(Ok(currentToken));
				}


				[HttpPost("auth/refresh")]
				public async Task<IActionResult> GetTokenFromRefreshToken([FromBody] RequestTokenBody tokenBody)
				{
						HttpClient client = new HttpClient();

						var data = new Dictionary<string, string>();
						Application? app = _config.Apps.FirstOrDefault(e => e.App == tokenBody.App);

						if (app == null)
						{
								_logger.LogError("Invalid App Provided: " + tokenBody.App);

								HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid App Input";
								return Forbid();

						}

						data.Add("client_id", _config.authConfig.client_id);
						data.Add("client_secret", _config.authConfig.client_secret);
						data.Add("scope", _config.authConfig.scope);
						data.Add("redirect_uri", app.RedirectUri);
						data.Add("grant_type", "refresh_token");
						data.Add("refresh_token", tokenBody.Refresh_Token);

						FormUrlEncodedContent content = new FormUrlEncodedContent(data);
						HttpResponseMessage resp = await client.PostAsync("https://oauth2.googleapis.com/token", content);
						if (!resp.IsSuccessStatusCode) return Unauthorized();
						string result = await resp.Content.ReadAsStringAsync();

						GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);

						int tokenLifetime = 300;
						if (string.IsNullOrEmpty(currentToken!.refresh_token))
						{
								_logger.LogWarning("No refresh token was received!");
								tokenLifetime = 60;

						}

						//byte[] byteData = Convert.FromBase64String(currentToken!.id_token.Split(".")[1]);

						var handler = new JwtSecurityTokenHandler();
						var idToken = handler.ReadJwtToken(currentToken!.id_token);

						//string decodedString = System.Text.Encoding.UTF8.GetString(byteData);Token

						//Dictionary<string, string>? gClaims = JsonSerializer.Deserialize<Dictionary<string, string>>(decodedString);

						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);

						List<Claim> claims = new List<Claim>();
						string[] claimsToCopy = new[] { "sub", "email", "nane", "azp" };
						claims = idToken.Claims.Where(e => claimsToCopy.Contains(e.Type)).ToList();
						Claim? emailClaim = claims.FirstOrDefault(e => e.Type == "email");
						User? user = await _user.GetByEmailAsync(emailClaim!.Value)!;
						if (user == null)
						{
								_logger.LogInformation($"{emailClaim!.Value} has no linked user");
								return Forbid();
						}

						if (user != null)
						{
								claims.Add(new Claim("userId", user!.Id.ToString()));
								claims.Add(new Claim(ClaimTypes.Role, "Registered"));
								claims.Add(new Claim("appId", tokenBody.App));
								user.Roles.ToList().ForEach(e =>
								{
										claims.Add(new Claim(ClaimTypes.Role, e));
								});
						}
						else
						{
								claims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
						}

						//foreach (var item in gClaims!)
						//{
						//		claims.Add(new Claim(item.Key, item.Value));
						//}

						var tokenDescriptor = new SecurityTokenDescriptor
						{
								Subject = new ClaimsIdentity(claims.Where(e => e.Type != "aud")),
								Expires = DateTime.UtcNow.AddMinutes(tokenLifetime),
								Issuer = _config.jwtConfig.issuer,
								Audience = _config.jwtConfig.audience,

								SigningCredentials = new SigningCredentials
								(new SymmetricSecurityKey(key),
								SecurityAlgorithms.HmacSha256)
						};
						var tokenHandler = new JwtSecurityTokenHandler();
						var token = tokenHandler.CreateToken(tokenDescriptor);
						var jwtToken = tokenHandler.WriteToken(token);
						var stringToken = tokenHandler.WriteToken(token);
						currentToken.access_token = stringToken;



						return await Task.FromResult(Ok(currentToken));
				}

				public class RequestTokenBody
				{
						public string Code { get; set; } = string.Empty;
						public string Refresh_Token { get; set; } = string.Empty;
						public string App { get; set; } = string.Empty;
				}
		}
}
