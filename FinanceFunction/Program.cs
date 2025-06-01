using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.ApplicationInsights.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Configuration;
using FinanceFunction.Models;
using FinanceFunction.Data.CosmosRepo;
using FinanceFunction.Middlewares;
using FinanceFunction.Utilities;
using FinanceFunction.Dtos;
using Microsoft.AspNetCore.Http;

var builder = FunctionsApplication.CreateBuilder(args);


var webapp = builder.ConfigureFunctionsWebApplication();
var Configuration = builder.Configuration;

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
		options.ForwardedHeaders =
				ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});


var config = FnConfigToAppConfig.PrepareConfig();
builder.Services.AddSingleton(config);
builder.Services.AddScoped<CurrentUser>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(typeof(CancellationToken), serviceProvider =>
{
		IHttpContextAccessor httpContext = serviceProvider.GetRequiredService<IHttpContextAccessor>();
		return httpContext.HttpContext?.RequestAborted ?? CancellationToken.None;
});
//builder.Services.AddOpen Telemetry().UseAzureMonitor(e =>
//{
//		e.ConnectionString = builder.Configuration.GetSection("InsightsLogging").GetValue<string>("ConnectionString");
//});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
			.AddJwtBearer(options =>
			{
					options.TokenValidationParameters = new TokenValidationParameters
					{
							ValidateIssuer = true,
							ValidateAudience = true,
							ValidateLifetime = true,
							ValidateIssuerSigningKey = true,
							ValidIssuer = config.jwtConfig.issuer,
							ValidAudience = config.jwtConfig.audience,
							IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.jwtConfig.issuer))
					};
			});




////application insights isn't enabled by default. see https://aka.ms/aat8mw4.
builder.Services
		.AddApplicationInsightsTelemetryWorkerService();
//.ConfigureFunctionsApplicationInsights();



builder.Services.AddCors(opt =>
		{
				opt.AddPolicy("devCorsPolicy", builder =>
				{
						//builder.SetIsOriginAllowedToAllowWildcardSubdomains().WithOrigins(["https://*.adolfrey.com/"]).AllowAnyHeader();
						builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
						.WithExposedHeaders(["X-GLogin-Error", "X-Last-Trans"]);
						//builder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost");
						//builder.SetIsOriginAllowed(origin	 => true);
				});
				opt.AddDefaultPolicy(builder =>
				{
						builder.SetIsOriginAllowedToAllowWildcardSubdomains()
						.WithOrigins(["https://*.adolfrey.com/", "https://adolfrey.com"])
																		.AllowAnyHeader()
																		.WithMethods(["GET", "POST", "PUT"])
						.WithExposedHeaders(["X-GLogin-Error", "X-Last-Trans"]);
				});
		});
builder.Services.AddFinanceAutomapper();
//if (config.DataImplementation.ToLower() == "sql")
//{
//		//builder.Services.AddSqlContext(Configuration);
//}
//else if (config.DataImplementation.ToLower() == "cosmos")
//{
builder.Services.AddCosmosContext(Configuration);
//}


webapp.UseMiddleware<AppMiddleware>();


var host = builder.Build();




host.Run();
