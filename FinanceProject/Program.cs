using AutoMapper;
using FinanceProject.Data;
using FinanceProject.Data.SqlRepo;
using FinanceProject.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Configuration;
using TypeLite;
using TypeLite.Net4;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json.Serialization;
using FinanceProject.Utilities;
using Microsoft.Identity.Web;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using FinanceApp.Utilities;
using Microsoft.Extensions.FileProviders;
using System;
using Microsoft.AspNetCore.Rewrite;

var builder = WebApplication.CreateBuilder(args);
var Configuration = builder.Configuration;
// Add services to the container.
AppConfig config = builder.Configuration.GetSection("AppConfig").Get<AppConfig>();



builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
						 .AddMicrosoftIdentityWebApi(Configuration, "AzureAd");


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

builder.Services.AddSingleton(config);
builder.Services.AddScoped<IAccountTypeRepo,AccountTypeRepo>();
builder.Services.AddScoped<IAccountGroupRepo,AccountGroupRepo>();
builder.Services.AddScoped<IAccountRepo,AccountRepo>();
builder.Services.AddScoped<ITransactionRepo,TransactionRepo>();
builder.Services.AddScoped<IAccountBalanceRepo,AccountBalanceRepo>();
builder.Services.AddScoped<IVendorRepo,VendorRepo>();
builder.Services.AddScoped<IScheduledTransactionRepo,ScheduledTransactionRepo>();
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
});

IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);





builder.Services.AddDbContext<AppDbContext>(opt =>
{
		var passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;
		
		var encrypted = Configuration.GetConnectionString("AzureSql")!;
		var connection = AesOperation.DecryptString(passkey, encrypted);
		opt.UseSqlServer(connection);	
});


builder.Services.AddAuthorization(e =>
{
		AuthorizationPolicy policy = new AuthorizationPolicyBuilder().RequireRole("Default_Access").Build();
		e.DefaultPolicy = policy;
});


var app = builder.Build();
TypeScript.Definitions().ForLoadedAssemblies();




if (app.Environment.IsDevelopment())
{
		app.UseCors("devCorsPolicy");
}
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
		// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
		app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAuthentication();

string[] apps = new []{ "/finance" };

foreach (var item in apps)
{
	app.MapWhen(ctx => ctx.Request.Path.StartsWithSegments(item), evt =>
	{
		string physicalPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", item.TrimStart('/', '\\'));


		IndexFallbackFileProvider provider = new IndexFallbackFileProvider(new PhysicalFileProvider(physicalPath));

		//app.MapFallbackToFile("index.html"); ;
		var staticFileOptions = new StaticFileOptions
		{
			FileProvider = provider,
			ServeUnknownFileTypes = true,
			RequestPath = item,
		};
		evt.UseRouting();

		evt.UseStaticFiles(staticFileOptions);
		evt.UseEndpoints(e => e.MapFallbackToFile(item + "/index.html" ));


	});
}

app.MapWhen(ctx => !apps.Any(path => ctx.Request.Path.StartsWithSegments(path)), evt =>
{
    //Console.WriteLine(!apps.Any(path => evt.Request.Path.StartsWithSegments(path)));
    evt.UseStaticFiles();
    evt.UseRouting();
    evt.UseEndpoints(e => e.MapFallbackToFile("index.html"));
});


app.UseAuthorization();

app.MapControllerRoute(
		name: "default",
		pattern: "{controller}/{action=Index}/{id?}");

app.Run();
