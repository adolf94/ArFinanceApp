
using FinanceFunction.Data;
using FinanceFunction.Dtos;
using FinanceFunction.Models;
using FinanceFunction.Utilities;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Buffers.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Passwordless;
using Newtonsoft.Json.Linq;
namespace FinanceFunction.Controllers;

public class AuthController
{
		private readonly ILogger<AuthController> _logger;
		private readonly AppConfig _config;
		private readonly IUserRepo _userRepo;
		private readonly CurrentUser _user;
		private readonly IPasswordlessClient _fido2;
		private readonly IDbHelper _db;
		private readonly string RequiredRole = "finance_user";

		public readonly int tokenLifetime = 60 * 4;
		public AuthController(ILogger<AuthController> logger, AppConfig config,
				IUserRepo userRepo, CurrentUser user, IDbHelper db, IPasswordlessClient fido2)
		{
				_logger = logger;
				_config = config;
				_userRepo = userRepo;
				_user = user;
				_fido2 = fido2;
				_db = db;
		}


		[Function("AuthWithGoogleCreds")]
		public async Task<IActionResult> AuthWithGoogleCreds(
				[HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/google_credential")]
				HttpRequest req
				)
		{
				var body = await req.ReadFromJsonAsync<CredentialResponse>();

				var settings = new GoogleJsonWebSignature.ValidationSettings()
				{
						// This is the most crucial part: verifying the ID token was issued to YOUR application.
						Audience = new List<string> { _config.authConfig.client_id }
				};
				try
				{
						GoogleJsonWebSignature.Payload payload = await GoogleJsonWebSignature.ValidateAsync(body.Credential, settings);

						// Validation successful! The payload contains the user information.
						var userId = payload.Subject;
						var email = payload.Email;
						var name = payload.Name;


						List<Claim> claims = new List<Claim>
						{
								new Claim("sub", payload.Subject),
								new Claim("email", payload.Email),
								new Claim("azp", _config.authConfig.client_id),
						};

						List<Claim> idClaims = claims.ToList();


						User? user = await _userRepo.GetByEmailAsync(payload.Email)!;
						GoogleClaimResponse? currentToken = new GoogleClaimResponse();

						if (user != null)
						{
								LoginLog? log = await _userRepo.CreateLoginLog(payload.JwtId, user.Id);
								if(log == null) return new UnauthorizedResult();
								claims.Add(new Claim("userId", user!.Id.ToString()));
								claims.Add(new Claim("app", "finance"));
								claims.Add(new Claim("name", user.Name ?? user.EmailAddress));
								claims.Add(new Claim("typ", "access_token"));

								idClaims.Add(new Claim("userId", user!.Id.ToString()));
								idClaims.Add(new Claim(ClaimTypes.Name, user.Name ?? user.EmailAddress));
								idClaims.Add(new Claim("typ", "id_token"));

								claims.Add(new Claim(ClaimTypes.Role, "Registered")); 
								idClaims.Add(new Claim(ClaimTypes.Role, "Registered"));

								user.Roles.ToList().ForEach(e =>
								{
										idClaims.Add(new Claim(ClaimTypes.Role, e));
										claims.Add(new Claim(ClaimTypes.Role, e));
								});
								currentToken.refresh_token = log.Id + "." + log.RefreshToken;
						}
						else
						{
								_logger.LogInformation($"{payload.Email} has no linked user");
								claims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
								idClaims.Add(new Claim(ClaimTypes.Role, "Unregistered"));
						}

						        
						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);
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
				catch (InvalidJwtException ex)
				{
						// The token is invalid (bad signature, expired, wrong audience, etc.)
						return new UnauthorizedObjectResult(new { Message = "Invalid Google ID Token", Error = ex.Message });
				}
				catch (Exception ex)
				{
						// Handle other potential exceptions
						return new ObjectResult( new { Message = "An error occurred during authentication", Error = ex.Message })
						{
								StatusCode = 500
						};
				}



		}


		[Function("RefreshToken")]
		public async Task<IActionResult> RefreshToken([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/refresh")]
				HttpRequest req)
		{
				var body = await req.ReadFromJsonAsync<RequestTokenBody>();
				if (body == null ) return new BadRequestResult();
				Guid id;
				string refreshToken;
				try
				{
						var splitRefresh = body.Refresh_Token.Split(".");
						id = Guid.Parse(splitRefresh[0]);
						refreshToken = splitRefresh[1];
				}catch(Exception ex)
				{
						return new BadRequestResult();
				}

				var item = await _userRepo.GetLoginLog(id.ToString());
				if(item == null)
				{

						return new StatusCodeResult(401);
				}
				if(item.RefreshToken != refreshToken || item.Expiry < DateTime.UtcNow || item.MovingExpiry < DateTime.UtcNow)
				{
						item.IsExpired = true;
						await _db.SaveChangesAsync();
						return new StatusCodeResult(401);
				}

				if (item.MovingExpiry < DateTime.UtcNow.AddDays(1))
				{
						item.MovingExpiry = DateTime.UtcNow.AddDays(4);
				}
				GoogleClaimResponse? currentToken = new GoogleClaimResponse();

				byte[] originalBytes = System.Text.Encoding.UTF8.GetBytes(UUIDNext.Uuid.NewRandom().ToString());
				refreshToken = Convert.ToBase64String(originalBytes);

				item.RefreshToken = refreshToken;
				User? user = await _userRepo.GetById(item.UserId)!;

				if(user == null) return new BadRequestResult();





				List<Claim> claims = new List<Claim>
				{
						new Claim("sub", user.Id.ToString()),
						new Claim("userId", user.Id.ToString()),
						new Claim("name", user.Name.ToString()),
						new Claim("email", user.EmailAddress),
						new Claim("azp", _config.authConfig.client_id),
						new Claim("typ", "access_token")
				};


				user.Roles.ToList().ForEach(e =>
				{
						claims.Add(new Claim(ClaimTypes.Role, e));
				});


				var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);
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

				var tokenHandler = new JwtSecurityTokenHandler();
				var token = tokenHandler.CreateToken(accessDescriptor);
				var strClaimToken = tokenHandler.WriteToken(token);

				await _db.SaveChangesAsync();
				currentToken.access_token = strClaimToken;
				currentToken.refresh_token = item.Id + "." + refreshToken;
				return new OkObjectResult(currentToken);
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
				string[] claimsToCopy = new[] { "sub", "email", "name", "azp" };
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

						claims.Add(new Claim(ClaimTypes.Role, "Registered")); 
						idClaims.Add(new Claim(ClaimTypes.Name, user.Name));
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

		[Function("CreatePasskey")]
		public async Task<IActionResult> CreatePasskey([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/fido/create")]
						HttpRequest req, string alias)
		{

				if (!_user.IsAuthenticated) return new UnauthorizedResult();


				var payload = new RegisterOptions(_user.UserId.ToString(), alias)
				{
						Aliases = new HashSet<string> { alias },
						Username = _user.EmailAddress,
						DisplayName = _user.Name
				};


				try
				{
						var token = await _fido2.CreateRegisterTokenAsync(payload);
						return new OkObjectResult(token);
				}
				catch (PasswordlessApiException e)
				{
						return new ObjectResult(e.Details) { StatusCode = 401 };						
				}

		}

		[Function("GetPasskeys")]
		public async Task<IActionResult> GetPasskeys([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "auth/fido/credentials")]
						HttpRequest req)
		{
				if (!_user.IsAuthenticated) return new UnauthorizedResult();

				var credentials = await _fido2.ListCredentialsAsync(_user.UserId.ToString());


				return new OkObjectResult(credentials);
		}

		[Function("LoginWithPasskey")]
		public async Task<IActionResult> LoginWithPasskey([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/fido")]
						HttpRequest req, string token)
		{

				try
				{
						var verifiedUser = await _fido2.VerifyAuthenticationTokenAsync(token);

						var userId = verifiedUser.UserId;
						GoogleClaimResponse? currentToken = new GoogleClaimResponse();
						var user = await _userRepo.GetById(Guid.Parse(userId));


						if (user == null)
						{
								return new UnauthorizedResult();
						}




						LoginLog? log = await _userRepo.CreateLoginLog(verifiedUser.TokenId.ToString(), user!.Id);
						if (log == null) return new UnauthorizedResult();


						List<Claim> claims = new List<Claim>
						{
								new Claim("sub", user.Id.ToString()),
								new Claim("userId", user.Id.ToString()),
								new Claim("name", user.Name.ToString()),
								new Claim("email", user.EmailAddress),
								new Claim("azp", _config.authConfig.client_id),
								new Claim("type", "access_token"),
								new Claim(ClaimTypes.Role, "Registered")
						};


						List<Claim> idClaims = new List<Claim>
						{
								new Claim("sub", user.Id.ToString()),
								new Claim("userId", user.Id.ToString()),
								new Claim("name", user.Name.ToString()),
								new Claim("email", user.EmailAddress),
								new Claim("azp", _config.authConfig.client_id),
								new Claim("type", "id_token"),
								new Claim(ClaimTypes.Role, "Registered")
						};


						claims.Add(new Claim(ClaimTypes.Role, "Registered"));
						idClaims.Add(new Claim(ClaimTypes.Role, "Registered"));

						user.Roles.ToList().ForEach(e =>
						{
								idClaims.Add(new Claim(ClaimTypes.Role, e));
								claims.Add(new Claim(ClaimTypes.Role, e));
						});


						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);
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
						var accessTokenNew = tokenHandler.CreateToken(accessDescriptor);
						var strClaimToken = tokenHandler.WriteToken(accessTokenNew);
						currentToken.access_token = strClaimToken;

						var idTokenNew = tokenHandler.CreateToken(idDescriptor);
						var strIdToken = tokenHandler.WriteToken(idTokenNew);
						currentToken.refresh_token = log.Id + "." + log.RefreshToken;
					
						return new OkObjectResult(currentToken);
				}
				catch (PasswordlessApiException e)
				{
						return new JsonResult(e.Details)
						{
								StatusCode = 401
						};
				}

		}
}


public class RequestTokenBody
{
		public string Code { get; set; } = string.Empty;
		public string Refresh_Token { get; set; } = string.Empty;
		public string App { get; set; } = string.Empty;
}


public class CredentialResponse
{
		public string Credential { get; set; }
}

