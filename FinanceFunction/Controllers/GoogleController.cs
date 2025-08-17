using FinanceFunction.Data;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace FinanceFunction.Controllers;

public class GoogleController
{
		private readonly ILogger<GoogleController> _logger;
		private readonly AppConfig _config;
		private readonly IUserRepo _userRepo;
		private readonly CurrentUser _user;
		private readonly string RequiredRole = "finance_user";

		public GoogleController(ILogger<GoogleController> logger, AppConfig config, IUserRepo userRepo, CurrentUser user)
		{
				_logger = logger;
				_config = config;
				_userRepo = userRepo;
				_user = user;
		}

		[Function("AuthWithGoogle")]
		public async Task<IActionResult> Run(
				[HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "google/auth")]
				HttpRequest req
				)
		{
				HttpClient client = new HttpClient();
				var body = await req.ReadFromJsonAsync<RequestTokenBody>();

				var data = new Dictionary<string, string>();
				if (body!.App == "finance")
				{
				}
				else
				{

						req.HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid App Text";
						return new ForbidResult();
				}
				//get redirect 
				data.Add("client_id", _config.authConfig.client_id);
				data.Add("client_secret", _config.authConfig.client_secret);
				data.Add("scope", _config.authConfig.scope);
				data.Add("redirect_uri", _config.authConfig.redirect_uri);
				data.Add("grant_type", "authorization_code");
				data.Add("code", body.Code);

				FormUrlEncodedContent content = new FormUrlEncodedContent(data);
				HttpResponseMessage resp = await client.PostAsync("https://oauth2.googleapis.com/token", content);
				string result = await resp.Content.ReadAsStringAsync();
				if (!resp.IsSuccessStatusCode)
				{
						Dictionary<string, string> error = JsonSerializer.Deserialize<Dictionary<string, string>>(result);

						if (error == null)
						{
								_logger.LogError("No Error result found for Google Auth");
								return new ObjectResult(result)
								{
										StatusCode = StatusCodes.Status500InternalServerError
								};
						}
						if (!error.ContainsKey("error"))
						{
								_logger.LogError("No Error KEY found for Google Auth");
								_logger.LogError(result);
								return new ObjectResult(result)
								{
										StatusCode = StatusCodes.Status500InternalServerError
								};
						}

						switch (error["error"])
						{
								case "redirect_uri_mismatch":
										_logger.LogError("Misconfiguration : REDIRECT URL MISMATCH");
										return new ObjectResult(result)
										{
												StatusCode = StatusCodes.Status500InternalServerError
										};
								case "invalid_client":
										_logger.LogError("Misconfiguration : INVALID CLIENT");
										return new ObjectResult(result)
										{
												StatusCode = StatusCodes.Status500InternalServerError
										};
								case "invalid_grant":
										req.HttpContext.Response.Headers["X-GLogin-Error"] = "Invalid Code Key";
										return new UnauthorizedObjectResult("");
								default:
										_logger.LogError("Uncaught Error : " + error["error"]);
										return new ObjectResult(result)
										{
												StatusCode = StatusCodes.Status500InternalServerError
										};
						}
				}

				int tokenLifetime = 360 * 4;
				GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);
				if (string.IsNullOrEmpty(currentToken!.refresh_token))
				{
						_logger.LogWarning("No refresh token was received!");
						// tokenLifetime = 60;
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

						return new ObjectResult(result)
						{
								StatusCode = StatusCodes.Status500InternalServerError
						};
				}

				User? user = await _userRepo.GetByEmailAsync(emailClaim!.Value)!;


				if (user != null)
				{
						claims.Add(new Claim("userId", user!.Id.ToString()));
						claims.Add(new Claim("app", body.App));
						claims.Add(new Claim("type", "access_token"));

						idClaims.Add(new Claim("userId", user!.Id.ToString()));
						idClaims.Add(new Claim(ClaimTypes.Name, user.Name));
						idClaims.Add(new Claim("type", "id_token"));

						claims.Add(new Claim(ClaimTypes.Role, "Registered")); idClaims.Add(new Claim(ClaimTypes.Name, user.Name));
						idClaims.Add(new Claim(ClaimTypes.Role, "Registered"));

						user.Roles.ToList().ForEach(e =>
						{
								idClaims.Add(new Claim(ClaimTypes.Role, e));

								claims.Add(new Claim(ClaimTypes.Role, e));
						});
				}
				else
				{
						_logger.LogInformation($"{emailClaim!.Value} has no linked user");
						claims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
						idClaims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
				}

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
				return await Task.FromResult(new OkObjectResult(currentToken));

				}
		}


public class RequestTokenBody
{
		public string Code { get; set; } = string.Empty;
		public string Refresh_Token { get; set; } = string.Empty;
		public string App { get; set; } = string.Empty;
}

