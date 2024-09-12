using FinanceApp.Data;
using FinanceApp.Dto;
using FinanceProject.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace FinanceApp.Controllers
{
		[Route("api/google")]
		[ApiController]
		public class GoogleController : ControllerBase
		{
				private readonly AppConfig _config;
				private readonly IUserRepo _user;
				private readonly ILogger<GoogleController> _logger;

				public GoogleController(AppConfig config, IUserRepo user, ILogger<GoogleController> logger)
				{
						_config = config;
						_user = user;
						_logger = logger;
				}

				[HttpPost("auth")]
				public async Task<IActionResult> GetGoogleToken([FromBody] RequestTokenBody tokenBody)
				{
						HttpClient client = new HttpClient();

						var data = new Dictionary<string, string>();

						data.Add("client_id", _config.authConfig.client_id);
						data.Add("client_secret", _config.authConfig.client_secret);
						data.Add("scope", _config.authConfig.scope);
						data.Add("redirect_uri", _config.authConfig.redirect_uri);
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
												_logger.LogError("Misconifguration : REDIRECT URL MISMATCH");
												return StatusCode(500);
										case "invalid_client":
												_logger.LogError("Misconifguration : INVALID CLIENT");
												return StatusCode(500);
										case "invalid_grant":
												HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid Code Key";
												return Unauthorized();
										default:
												_logger.LogError("Uncaught Error : " + error["error"]);
												return StatusCode(500);
								}
						}
						int tokenLifetime = 5;
						GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);
						if (string.IsNullOrEmpty(currentToken!.refresh_token))
						{
								_logger.LogWarning("No refresh token was received!");
								tokenLifetime = 30;
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
						User? user = await _user.GetByEmailAsync(claims.FirstOrDefault(e => e.Type == "email").Value!)!;

						claims.Add(new Claim("userId", user!.Id.ToString()));
						claims.Add(new Claim(ClaimTypes.Role, "Default_Access"));
						//foreach (var item in gClaims!)
						//{
						//		claims.Add(new Claim(item.Key, item.Value));
						//}
						var tokenDescriptor = new SecurityTokenDescriptor
						{
								Subject = new ClaimsIdentity(idToken.Claims.Where(e => e.Type != "aud")),
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


				[HttpPost("auth/refresh")]
				public async Task<IActionResult> GetTokenFromRefreshToken([FromBody] RequestTokenBody tokenBody)
				{
						HttpClient client = new HttpClient();

						var data = new Dictionary<string, string>();

						data.Add("client_id", _config.authConfig.client_id);
						data.Add("client_secret", _config.authConfig.client_secret);
						data.Add("scope", _config.authConfig.scope);
						data.Add("redirect_uri", _config.authConfig.redirect_uri);
						data.Add("grant_type", "refresh_token");
						data.Add("refresh_token", tokenBody.Refresh_Token);

						FormUrlEncodedContent content = new FormUrlEncodedContent(data);
						HttpResponseMessage resp = await client.PostAsync("https://oauth2.googleapis.com/token", content);
						if (!resp.IsSuccessStatusCode) return Unauthorized();
						string result = await resp.Content.ReadAsStringAsync();

						GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);

						int tokenLifetime = 5;
						if (string.IsNullOrEmpty(currentToken!.refresh_token))
						{
								_logger.LogWarning("No refresh token was received!");
								tokenLifetime = 30;

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
						User? user = await _user.GetByEmailAsync(claims.FirstOrDefault(e => e.Type == "email").Value!)!;

						claims.Add(new Claim("userId", user!.Id.ToString()));
						claims.Add(new Claim(ClaimTypes.Role, "Default_Access"));
						//foreach (var item in gClaims!)
						//{
						//		claims.Add(new Claim(item.Key, item.Value));
						//}

						var tokenDescriptor = new SecurityTokenDescriptor
						{
								Subject = new ClaimsIdentity(idToken.Claims.Where(e => e.Type != "aud")),
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
				}
		}
}
