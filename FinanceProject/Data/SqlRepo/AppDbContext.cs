using FinanceProject.Data;
using FinanceProject.Data.SqlRepo;
using FinanceProject.Models;
using FinanceProject.Utilities;
using Microsoft.EntityFrameworkCore;

namespace FinanceApp.Data.SqlRepo
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
				}
				protected override void OnConfiguring(DbContextOptionsBuilder builder)
				{

				}


				protected override void OnModelCreating(ModelBuilder builder)
				{


						builder.Entity<AccountType>()
										.HasData(
																		new { Id = new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"), Name = "Assets-Main", Enabled = true },
																		new { Id = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), Name = "Expenses-Main", Enabled = true },
																		new { Id = new Guid("04c78118-1131-443f-2fa6-08dac49f6ad4"), Name = "Income-Main", Enabled = true },
																		new { Id = new Guid("5b106232-530c-42d7-8d55-b4be282e8297"), Name = "Others-Main", Enabled = false }
																		);


						builder.Entity<AccountGroup>()
										.HasData(
																		new { Id = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), AccountTypeId = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), Name = "Adjustments", Enabled = false, isCredit = false }
																		);

						builder.Entity<Account>()
										.HasData(
																		new Account { Id = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"), AccountGroupId = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), Name = "Adjustments", Enabled = false, Balance = 0.00m }
																		);



						builder.Entity<Transaction>()
										.HasOne(e => e.Credit).WithMany(e => e.TransactionsAsCredit)
										.OnDelete(DeleteBehavior.NoAction);


						builder.Entity<Transaction>()
										.HasOne(e => e.Debit)
										.WithMany(e => e.TransactionsAsDebit)
										.OnDelete(DeleteBehavior.NoAction)
										;

						builder.Entity<Transaction>()
										.HasOne(e => e.Vendor);

						builder.Entity<Transaction>().HasOne(e => e.Schedule).WithMany(e => e.Transactions);
						builder.Entity<ScheduledTransactions>().HasOne(e => e.LastTransaction).WithOne(e => e.AsLastTransaction);
						builder.Entity<ScheduledTransactions>().HasIndex(e => e.LastTransactionDate).IsDescending();
						builder.Entity<ScheduledTransactions>().HasIndex(e => e.NextTransactionDate).IsDescending();
						builder.Entity<WeeklyBalance>().HasKey(bal => new { bal.AccountId, bal.StartDate });
						builder.Entity<AccountBalance>().HasKey(bal => new { bal.AccountId, bal.Month });



						base.OnModelCreating(builder);
				}



		}
		public static class ServiceExtensions
		{
				public static IServiceCollection AddSqlContext(this IServiceCollection services, ConfigurationManager Configuration)
				{


						services.AddDbContext<AppDbContext>(opt =>
						{
								var passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;

								var encrypted = Configuration.GetConnectionString("AzureSql")!;
								var connection = AesOperation.DecryptString(passkey, encrypted);
								opt.UseSqlServer(connection);
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
