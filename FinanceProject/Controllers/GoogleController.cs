﻿using FinanceApp.Data;
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

				public GoogleController(AppConfig config, IUserRepo user)
				{
						_config = config;
						_user = user;
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
						if (!resp.IsSuccessStatusCode) return Unauthorized();
						string result = await resp.Content.ReadAsStringAsync();
						GoogleClaimResponse? currentToken = JsonSerializer.Deserialize<GoogleClaimResponse>(result);


						//byte[] byteData = Convert.FromBase64String(currentToken!.id_token.Split(".")[1]);

						var handler = new JwtSecurityTokenHandler();
						var idToken = handler.ReadJwtToken(currentToken!.id_token);

						//string decodedString = System.Text.Encoding.UTF8.GetString(byteData);Token

						//Dictionary<string, string>? gClaims = JsonSerializer.Deserialize<Dictionary<string, string>>(decodedString);

						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);

						List<Claim> claims = new List<Claim>();
						string[] claimsToCopy = new[] { "sub", "email", "nane", "azp" };
						claims = idToken.Claims.Where(e => claimsToCopy.Contains(e.Type)).ToList();

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
								Expires = DateTime.UtcNow.AddMinutes(5),
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


						//byte[] byteData = Convert.FromBase64String(currentToken!.id_token.Split(".")[1]);

						var handler = new JwtSecurityTokenHandler();
						var idToken = handler.ReadJwtToken(currentToken!.id_token);

						//string decodedString = System.Text.Encoding.UTF8.GetString(byteData);Token

						//Dictionary<string, string>? gClaims = JsonSerializer.Deserialize<Dictionary<string, string>>(decodedString);

						var key = Encoding.UTF8.GetBytes(_config.jwtConfig.secret_key);

						List<Claim> claims = new List<Claim>();
						string[] claimsToCopy = new[] { "sub", "email", "nane", "azp" };
						claims = idToken.Claims.Where(e => claimsToCopy.Contains(e.Type)).ToList();

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
								Expires = DateTime.UtcNow.AddMinutes(5),
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
