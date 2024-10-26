using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data.CosmosRepo;
using FinanceApp.Dto;

//using FinanceApp.Data.SqlRepo;
using FinanceApp.Middleware;
using FinanceApp.Utilities;
using FinanceProject.Models;
using FinanceProject.Utilities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using TypeLite;
using TypeLite.Net4;

var builder = WebApplication.CreateBuilder(args);
var Configuration = builder.Configuration;
// Add services to the container.
AppConfig config = builder.Configuration.GetSection("AppConfig").Get<AppConfig>()!;



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
							IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.jwtConfig.secret_key)),
					};
			});

builder.Services.AddCors(opt =>
{
		opt.AddPolicy("devCorsPolicy", builder =>
		{
				//builder.SetIsOriginAllowedToAllowWildcardSubdomains().WithOrigins(["https://*.adolfrey.com/"]).AllowAnyHeader();
				builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
				.WithExposedHeaders(["X-GLogin-Error", "X-Last-Trans"]);
				//builder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost");
				//builder.SetIsOriginAllowed(origin => true);
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

if (config.DataImplementation.ToLower() == "sql")
{
		//builder.Services.AddSqlContext(Configuration);
}
else if (config.DataImplementation.ToLower() == "cosmos")
{
		builder.Services.AddCosmosContext(Configuration);
}

builder.Services.AddSingleton(config);
builder.Services.AddControllersWithViews()

		.AddJsonOptions(options =>
		{
				options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
				options.JsonSerializerOptions.Converters.Add(new NullableDateTimeConverter());
				options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());
		});
; var mapperConfig = new MapperConfiguration(mc =>
{
		//mc.SetGeneratePropertyMaps<Generate>()
		mc.AddProfile(new FinanceProject.Dto.AppProfile());
		mc.AddProfile(new FinanceApp.Dto.LoansProfile());
});

builder.Services.AddScoped<IAuthorizationHandler, RoleRequirementHandler>();

PersistentConfig pConfig = new PersistentConfig();
builder.Services.AddSingleton(pConfig);
builder.Services.AddSingleton<Sms>();


IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);



/// Config validation

builder.Services.AddRateLimiter(e =>
{

		e.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
		e.AddPolicy(policyName: "otpLimiter", opt =>
		{
				var request = opt.Request;
				request.EnableBuffering();
				var buffer = new byte[Convert.ToInt32(request.ContentLength)];
				var task = request.Body.ReadAsync(buffer, 0, buffer.Length);

				//get body string here...
				var requestContent = Encoding.UTF8.GetString(buffer);

				var body = JsonSerializer.Deserialize<CreateUserDto>(requestContent);
				var number = body!.MobileNumber;


				request.Body.Position = 0;  //rewinding the stream to 0

				return RateLimitPartition.GetFixedWindowLimiter(number,
						_ => new FixedWindowRateLimiterOptions
						{
								PermitLimit = 4,
								QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
								QueueLimit = 2,
								Window = TimeSpan.FromSeconds(30)
						});
		});
});

builder.Services.AddHostedService<OnStartupBgSvc>();
builder.Services.AddHostedService<ComputeInterestBg>();
builder.Services.AddAuthorization();



var app = builder.Build();
TypeScript.Definitions().ForLoadedAssemblies();



using (var scope = app.Services.CreateScope())
{
		var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
		logger.LogInformation($"Connection: " + (Configuration.GetConnectionString("CosmosDb") == "abcd" ? "" : "(basta hindi sya abcd)"));

		//logger.LogInformation($"authConfig.redirectUrl: {config.authConfig.redirect_uri}");
		logger.LogInformation($"authConfig.clientId: {config.authConfig.client_id}");
		logger.LogInformation($"authConfig.secret: " + (config.authConfig.client_secret == "abcd" ? "" : "(basta hindi sya abcd)"));
		logger.LogInformation($"authConfig.scope: {config.authConfig.scope}");
		logger.LogInformation($"authConfig.secret: " + (Environment.GetEnvironmentVariable("ENV_PASSKEY") == "abcd" ? "" : "(basta hindi sya abcd)"));
		logger.LogInformation($"jwtConfig.issuer: {config.jwtConfig.issuer}");
		logger.LogInformation($"jwtConfig.audience: {config.jwtConfig.audience}");
		logger.LogInformation($"jwtConfig.secret: " + (config.jwtConfig.secret_key == "abcd" ? "" : "(basta hindi sya abcd)"));

}



app.Lifetime.ApplicationStopping.Register(() =>
		{

				var scope = app.Services.CreateScope();

				PersistentConfig conf = scope.ServiceProvider.GetRequiredService<PersistentConfig>();
				ILogger<IHostApplicationLifetime> logger = scope.ServiceProvider.GetRequiredService<ILogger<IHostApplicationLifetime>>();



				string SchedFolder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
				string SchedTaskFile = Path.Combine(SchedFolder, "scheduled.json");
				if (!Directory.Exists(SchedFolder)) Directory.CreateDirectory(SchedFolder);

				string newConfig = System.Text.Json.JsonSerializer.Serialize(conf);
				File.WriteAllText(SchedTaskFile, newConfig);
				logger.LogInformation("schedTask file was written successfully");

		});

if (app.Environment.IsDevelopment())
{
		app.UseCors("devCorsPolicy");
		// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
		app.UseHsts();
}
else
{
		app.UseCors();

}


app.UseHttpsRedirection();
app.UseAuthentication();
app.UseMiddleware<AppMiddleware>();

string[] apps = new[] { "/finance" };


foreach (var item in apps)
{
		app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments(item), evt =>
		{
				string physicalPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", item.TrimStart(new[] { '/', '\\' }));


				IndexFallbackFileProvider provider = new IndexFallbackFileProvider(new PhysicalFileProvider(physicalPath));

				//app.MapFallbackToFile("index.html"); ;
				var staticFileOptions = new StaticFileOptions
				{
						FileProvider = provider,
						ServeUnknownFileTypes = true,
						RequestPath = item,
				};
				evt.UseRouting();
				evt.UseRateLimiter();

				app.UseAuthorization();

				evt.UseStaticFiles(staticFileOptions);
				evt.UseEndpoints(e => e.MapFallbackToFile(item + "/index.html"));


		});
}

app.MapWhen(ctx => !apps.Any(path => ctx.Request.Path.StartsWithSegments(path)), evt =>
{
		//Console.WriteLine(!apps.Any(path => evt.Request.Path.StartsWithSegments(path)));
		evt.UseStaticFiles();
		evt.UseRouting();
		evt.UseRateLimiter();
		evt.UseAuthorization();


		app.Use((ctx, next) =>
		{

				return next(ctx);
		});

		evt.UseEndpoints(e => e.MapFallbackToFile("index.html"));
});



app.MapControllerRoute(
		name: "default",
		pattern: "{controller}/{action=Index}/{id?}");




app.Run();
