﻿using FinanceApp.BgServices;
using FinanceApp.Data;
using FinanceProject.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace FinanceApp.Middleware
{
		// You may need to install the Microsoft.AspNetCore.Http.Abstractions package into your project
		public class AppMiddleware
		{
				private readonly RequestDelegate _next;
				private readonly IMemoryCache _cache;

				public AppMiddleware(RequestDelegate next, IMemoryCache cache)
				{
						_next = next;
						_cache = cache;
				}

				public async Task Invoke(HttpContext httpContext)
				{

						string? sid = httpContext.User.FindFirstValue("sid");
						string? cacheId = httpContext.Request.Headers["X-Client-Cache"];
						string? upn = httpContext.User.FindFirstValue(ClaimTypes.Email);


						List<Claim>? cacheClaims = null;
						if (!string.IsNullOrEmpty(sid) && !string.IsNullOrEmpty(sid)) cacheClaims = GetUserClaimsFromCache(httpContext);

						if (cacheClaims != null)
						{
								var identity = new ClaimsIdentity(cacheClaims);
								httpContext.User.AddIdentity(identity);
								await _next(httpContext);
								return;
						}

						if (!string.IsNullOrEmpty(upn))
						{
								IUserRepo _users = httpContext.RequestServices.GetRequiredService<IUserRepo>();
								cacheClaims = new List<Claim>();
								User? user = await _users.GetByEmailAsync(upn);
								if (user != null)
								{
										cacheClaims.Add(new Claim("userId", user.Id.ToString()));
								}
								var appIdentity = new ClaimsIdentity(cacheClaims);
								SetUserToCache(httpContext, cacheClaims);
								httpContext.User.AddIdentity(appIdentity);
						}

						httpContext.Response.OnStarting(state =>
						{
								var httpContext = (HttpContext)state;

								if (httpContext.Response.StatusCode >= 200 && httpContext.Response.StatusCode < 300)
								{

										var conf = httpContext.RequestServices.GetRequiredService<PersistentConfig>();

										httpContext.Response.Headers.Add("X-Last-Trans", conf.LastTransactionId);
								}
								return Task.CompletedTask;
						}, httpContext);

						await _next(httpContext);


				}



				public List<Claim>? GetUserClaimsFromCache(HttpContext httpContext)
				{
						IMemoryCache _cache = httpContext.RequestServices.GetRequiredService<IMemoryCache>();

						string? sid = httpContext.User.FindFirstValue("sid");
						string? cacheid = httpContext.Request.Headers["X-Client-Cache"];

						List<Claim> claims = null;

						_cache.TryGetValue("usr_" + sid + "_" + cacheid, out claims);

						return claims;
				}

				public void SetUserToCache(HttpContext httpContext, List<Claim> claims)
				{
						IMemoryCache _cache = httpContext.RequestServices.GetRequiredService<IMemoryCache>();

						string? sid = httpContext.User.FindFirstValue("sid");
						string? cacheid = httpContext.Request.Headers["X-Client-Cache"];

						_cache.Set("usr_" + sid + "_" + cacheid, claims, new MemoryCacheEntryOptions
						{
								AbsoluteExpirationRelativeToNow = new TimeSpan(0, 30, 0),
								SlidingExpiration = new TimeSpan(0, 5, 0)
						});

				}

		}

		// Extension method used to add the middleware to the HTTP request pipeline.
		public static class MiddlewareExtensions
		{
				public static IApplicationBuilder UseMiddleware(this IApplicationBuilder builder)
				{
						return builder.UseMiddleware<AppMiddleware>();
				}
		}
}
