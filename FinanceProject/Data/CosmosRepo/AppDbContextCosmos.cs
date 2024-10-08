﻿using FinanceProject.Data;
using FinanceProject.Models;
using FinanceProject.Utilities;
using CosmosModels = FinanceApp.Data.CosmosRepo.Dtos;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;

namespace FinanceApp.Data.CosmosRepo
{
		public class AppDbContext : DbContext
		{
				public DbSet<Account>? Accounts { get; set; }
				public DbSet<AccountGroup>? AccountGroups { get; set; }
				public DbSet<AccountType>? AccountTypes { get; set; }
				public DbSet<Transaction>? Transactions { get; set; }
				public DbSet<User>? Users { get; set; }
				public DbSet<Vendor>? Vendors { get; set; }
				public DbSet<AccountBalance>? AccountBalances { get; set; }
				public DbSet<ScheduledTransactions>? ScheduledTransactions { get; set; }

				private readonly IConfiguration _configuration;
				public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)
				{
						_configuration = config;
						base.Database.EnsureCreatedAsync().Wait();
				}


				protected override void OnModelCreating(ModelBuilder builder)
				{

						builder.Entity<AccountType>()
								.HasData(
										new { Id = new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"), Name = "Assets-Main", Enabled = true, ShouldResetPeriodically = false },
										new { Id = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), Name = "Expenses-Main", Enabled = true, ShouldResetPeriodically = true },
										new { Id = new Guid("04c78118-1131-443f-2fa6-08dac49f6ad4"), Name = "Income-Main", Enabled = true, ShouldResetPeriodically = true },
										new { Id = new Guid("5b106232-530c-42d7-8d55-b4be282e8297"), Name = "Others-Main", Enabled = false, ShouldResetPeriodically = false }
								);

						builder.Entity<AccountGroup>()
								.HasData(
										new { Id = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), AccountTypeId = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), Name = "Adjustments", Enabled = false, isCredit = false }
								);

						builder.Entity<Account>()
								.HasData(
										new Account { Id = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"), AccountGroupId = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), Name = "Adjustments", ResetEndOfPeriod = true, ForeignExchange = 0, PeriodStartDay = 1, CurrBalance = 0, Enabled = false, Balance = 0.00m }
								);
						builder.Entity<AccountType>()
								.ToContainer("AccountType")
								.HasPartitionKey(e => e.Id);


						builder.Entity<AccountBalance>()
								.ToContainer("AccountBalance")
								.HasPartitionKey(e => new { e.Year, e.Month, e.AccountId })
								.HasKey(e => e.Id);


						builder.Entity<AccountGroup>()
						.ToContainer("AccountGroup")
						.HasPartitionKey(e => e.Id);

						builder.Entity<Account>()
										.ToContainer("Account").HasPartitionKey(e => e.Id)
										.HasOne(e => e.AccountGroup);


						builder.Entity<ScheduledTransactions>()
										.ToContainer("ScheduledTransactions").HasPartitionKey(e => e.Id)
										.Ignore(e => e.LastTransaction);



						builder.Entity<Transaction>()
										.ToContainer("Transaction").HasPartitionKey(e => e.Id)
										.HasOne(e => e.Credit).WithMany(e => e.TransactionsAsCredit);


						builder.Entity<Transaction>().HasPartitionKey(e => e.Id)
								.Ignore(e => e.Debit).Ignore(e => e.Credit).Ignore(e => e.AsLastTransaction).Ignore(e => e.Vendor);


						builder.Entity<Vendor>().HasPartitionKey(e => e.Id)
										.ToContainer("Vendor")
										.HasKey(e => e.Id);

						builder.Entity<User>().HasPartitionKey(e => e.Id)
										.ToContainer("User")
										.HasKey(e => e.Id);

						//builder.Entity<User>();
								//.Property(e=>e.Roles)
								//.HasConversion(
								//		v=> JsonConvert.SerializeObject(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
								////(v) => JArray.FromObject(v),
								//		v => JsonConvert.DeserializeObject<List<Role>>(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore })!
								//);


						base.OnModelCreating(builder);
				}



		}

		public static class ServiceExtension
		{

				public static IServiceCollection AddCosmosContext(this IServiceCollection services, ConfigurationManager Configuration)
				{


						services.AddDbContext<AppDbContext>(opt =>
						{
								var passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;

								var encrypted = Configuration.GetConnectionString("CosmosDb")!;
								var connection = AesOperation.DecryptString(passkey, encrypted);
								opt.UseCosmos(connection, "FinanceApp");
						});

						services.AddScoped<IAccountTypeRepo, AccountTypeRepo>();
						services.AddScoped<IAccountGroupRepo, AccountGroupRepo>();
						services.AddScoped<IAccountRepo, AccountRepo>();
						services.AddScoped<ITransactionRepo, TransactionRepo>();
						services.AddScoped<IAccountBalanceRepo, AccountBalanceRepo>();
						services.AddScoped<IVendorRepo, VendorRepo>();
						services.AddScoped<IScheduledTransactionRepo, ScheduledTransactionRepo>();
						services.AddScoped<IUserRepo, UserRepo>();

						return services;
				}
		}
}
