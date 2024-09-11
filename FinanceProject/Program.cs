using AutoMapper;
using FinanceApp.BgServices;
using FinanceApp.Data.CosmosRepo;
using FinanceApp.Middleware;
using FinanceApp.Utilities;
using FinanceProject.Models;
using FinanceProject.Utilities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
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
				//builder.WithOrigins("http://localhost:800").AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
				builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
				//builder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost");
				//builder.SetIsOriginAllowed(origin => true);
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
		if (config.DataImplementation.ToLower() == "cosmos")
		{
				mc.AddCosmosMapper();
		}
});


PersistentConfig pConfig = new PersistentConfig();
builder.Services.AddSingleton(pConfig);


IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);



/// Config validation



builder.Services.AddHostedService<OnStartupBgSvc>();
builder.Services.AddAuthorization();



var app = builder.Build();
TypeScript.Definitions().ForLoadedAssemblies();



using (var scope = app.Services.CreateScope())
{
		var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

		logger.LogInformation($"authConfig.redirectUrl: {config.authConfig.redirect_uri}");
		logger.LogInformation($"authConfig.clientId: {config.authConfig.client_id}");
		logger.LogInformation($"authConfig.secret: " + (config.authConfig.client_secret == "abcd" ? "" : "(basta hindi sya abcd)"));
		logger.LogInformation($"authConfig.scope: {config.authConfig.scope}");
		logger.LogInformation($"jwtConfig.issuer: {config.jwtConfig.issuer}");
		logger.LogInformation($"jwtConfig.audience: {config.jwtConfig.audience}");
		logger.LogInformation($"jwtConfig.secret: " + (config.jwtConfig.secret_key == "abcd" ? "" : "(basta hindi sya abcd)"));

}



app.Lifetime.ApplicationStopping.Register(() =>
		{

				var scope = app.Services.CreateScope();

				PersistentConfig conf = scope.ServiceProvider.GetRequiredService<PersistentConfig>();



				string SchedFolder = Path.Combine(scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>().ContentRootPath, "configs");
				string SchedTaskFile = Path.Combine(SchedFolder, "scheduled.json");
				if (!Directory.Exists(SchedFolder)) Directory.CreateDirectory(SchedFolder);

				string newConfig = System.Text.Json.JsonSerializer.Serialize(conf);
				File.WriteAllText(SchedTaskFile, newConfig);


		});

if (app.Environment.IsDevelopment())
{
		app.UseCors("devCorsPolicy");
		// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
		app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAuthentication();
app.UseMiddleware<AppMiddleware>();

string[] apps = new[] { "/finance" };

foreach (var item in apps)
{
		app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments(item), evt =>
		{
				string physicalPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", item.TrimStart(new char[] { '/', '\\' }));


				IndexFallbackFileProvider provider = new IndexFallbackFileProvider(new PhysicalFileProvider(physicalPath));

				//app.MapFallbackToFile("index.html"); ;
				var staticFileOptions = new StaticFileOptions
				{
						FileProvider = provider,
						ServeUnknownFileTypes = true,
						RequestPath = item,
				};
				evt.UseRouting();
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
		// Added multiple MapWhen
#pragma warning disable ASP0001 // Authorization middleware is incorrectly configured
		app.UseAuthorization();
#pragma warning restore ASP0001 // Authorization middleware is incorrectly configured
		evt.UseEndpoints(e => e.MapFallbackToFile("index.html"));
});



app.MapControllerRoute(
		name: "default",
		pattern: "{controller}/{action=Index}/{id?}");





app.Run();
