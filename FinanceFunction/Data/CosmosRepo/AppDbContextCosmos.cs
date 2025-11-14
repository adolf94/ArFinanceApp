using FinanceFunction.Models;
using FinanceFunction.Data;
//using FinanceFunction.Utilities;
using Microsoft.EntityFrameworkCore;
using User = FinanceFunction.Models.User;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FinanceFunction.Utilities;

namespace FinanceFunction.Data.CosmosRepo
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
        public DbSet<LoanProfile>? LoanProfiles { get; set; }
        public DbSet<Loan>? Loans { get; set; }
        public DbSet<ScheduledTransactions>? ScheduledTransactions { get; set; }
        public DbSet<PaymentRecord>? Payments { get; set; }
        public DbSet<LoanPayment>? LoanPayments { get; set; }
        public DbSet<CoopOption>? CoopOptions { get; set; }
        public DbSet<MemberProfile>? MemberProfiles { get; set; }
        public DbSet<LedgerAccount>? LedgerAccounts { get; set; }
        public DbSet<LedgerEntry>? LedgerEntries { get; set; }
        public DbSet<InputLogs>? AuditLogs { get; set; }
        public DbSet<HookMessage>? HookMessages { get; set; }
        public DbSet<MonthlyTransaction> MonthTransactions { get; set; }
        public DbSet<HookReference> HookReferences { get; set; }
        public DbSet<BlobFile> Files { get; set; }
        public DbSet<Tag> Tags { get; set; }

				public DbSet<HookConfig> HookConfigs { get; set; }

				public Guid InterestIncomeId { get; set; } = Guid.Parse("742070bd-e68b-45c9-a1f7-021916127731");


        private readonly IConfiguration _configuration;
        public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)
        {
            _configuration = config;
            //base.Database.EnsureCreatedAsync().Wait();
        }


        protected override void OnModelCreating(ModelBuilder builder)
        {

            builder.Entity<AccountType>()
                .HasData(
                    new
                    {
                        Id = new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"),
                        Name = "Assets-Main",
                        Enabled = true,
                        ShouldResetPeriodically = false,
                        PartitionKey = "default"
                    },
                    new
                    {
                        Id = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"),
                        Name = "Expenses-Main",
                        Enabled = true,
                        ShouldResetPeriodically = true,
                        PartitionKey = "default"
                    },
                    new
                    {
                        Id = new Guid("04c78118-1131-443f-2fa6-08dac49f6ad4"),
                        Name = "Income-Main",
                        Enabled = true,
                        ShouldResetPeriodically = true,
                        PartitionKey = "default"
                    },
                    new
                    {
                        Id = new Guid("5b106232-530c-42d7-8d55-b4be282e8297"),
                        Name = "Others-Main",
                        Enabled = false,
                        ShouldResetPeriodically = false,
                        PartitionKey = "default"
                    }
                );

            builder.Entity<AccountGroup>()

                .HasData(
                    new
                    {
                        Id = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"),
                        AccountTypeId = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"),
                        Name = "Adjustments",
                        Enabled = false,
                        isCredit = false,
                        PartitionKey = "default"
                    }
                );

            builder.Entity<Account>()
                .HasData(
                    new Account
                    {
                        Id = new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"),
                        AccountGroupId = new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"),
                        Name = "Adjustments",
                        ResetEndOfPeriod = true,
                        ForeignExchange = 0,
                        PeriodStartDay = 1,
                        CurrBalance = 0,
                        Enabled = false,
                        Balance = 0.00m,
                        PartitionKey = "default"
                    }
                );
            builder.Entity<AccountType>()
                .ToContainer("AccountType")
                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(c => c.Id);


            builder.Entity<AccountBalance>()
                .ToContainer("AccountBalance")
                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(c => c.Id);


            builder.Entity<AccountGroup>()
                .ToContainer("AccountGroup")
                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(c => c.Id);

            builder.Entity<Account>()
                .ToContainer("Account")
                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(e => e.Id);
            builder.Entity<Account>().HasOne(e => e.AccountGroup);

            builder.Entity<MonthlyTransaction>().ToContainer("MonthTransactions")
                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(e => e.MonthKey);

            builder.Entity<ScheduledTransactions>()
                .ToContainer("ScheduledTransactions")
                .Ignore(e => e.LastTransaction);

            builder.Entity<ScheduledTransactions>()

                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(c => c.Id);

            builder.Entity<HookReference>()
                .HasPartitionKey(e=>e.PartitionKey)
                .ToContainer("HookReferences");

            builder.Entity<HookMessage>()
                .ToContainer("HookMessages")
                .HasPartitionKey(e => e.MonthKey)
                .HasKey(c => c.Id);

            builder.Entity<HookMessage>()
                .Property(e => e.TimeToLive)
                .ToJsonProperty("ttl");

            builder.Entity<Transaction>()
                .ToContainer("Transaction")
                .HasOne(e => e.Credit).WithMany(e => e.TransactionsAsCredit);

            builder.Entity<Transaction>()

                .HasPartitionKey(e => e.PartitionKey)
                .HasKey(c => c.Id);

            builder.Entity<Transaction>()
                .Ignore(e => e.Debit).Ignore(e => e.Credit).Ignore(e => e.AsLastTransaction)
                .Ignore(e => e.Vendor);


            builder.Entity<Vendor>()
                .HasPartitionKey(e => e.PartitionKey)
                .ToContainer("Vendor")
                .HasKey(c => c.Id);

            builder.Entity<User>()
                .HasPartitionKey(e => e.PartitionKey)
                .ToContainer("User")
                .HasKey(c => c.Id)
                ;

            builder.Entity<BlobFile>()
								.HasPartitionKey(e => e.PartitionKey)
								.ToContainer("Files")
								.HasKey(c => c.Id);



						builder.Entity<LoanPayment>().HasPartitionKey(e => new { e.AppId })
                .ToContainer("LoanPayments")
                .HasKey(e => new { e.LoanId, e.PaymentId, e.AgainstPrincipal });
            //builder.Entity<LoanPayment>().HasIndex(e => new { e.AppId, e.UserId, e.Date });

            builder.Entity<PaymentRecord>().HasPartitionKey(e => new { e.AppId })

                .ToContainer("Payments").HasKey(e => e.Id);



            builder.Entity<LoanProfile>().HasPartitionKey(e => new { e.AppId })
                .ToContainer("LoanProfiles")
                .HasKey(e => e.ProfileId);

            builder.Entity<Loan>().ToContainer("Loans").HasPartitionKey(e => new { e.AppId })
                .HasKey(e => e.Id);

            // builder.Entity<Loan>().HasIndex(e => new { e.AppId, e.UserId, e.Date });

            builder.Entity<CoopOption>().HasPartitionKey(e => new { e.AppId })
                .ToContainer("CoopOption").HasKey(e => new { e.AppId, e.Year });

            builder.Entity<MemberProfile>().HasPartitionKey(e => new { e.AppId })
                .ToContainer("MemberProfiles").HasKey(e => new { e.AppId, e.Year, e.UserId });

            builder.Entity<LedgerAccount>().ToContainer("LedgerAccounts").HasPartitionKey(e => e.PartitionKey).HasKey(e => e.LedgerAcctId)
                ;
            builder.Entity<LedgerEntry>()
                .ToContainer("LedgerEntries")
                .HasPartitionKey(e => e.MonthGroup)
                .HasKey(e => e.EntryId);
            builder.Entity<LedgerAccount>().HasData(
                new LedgerAccount { LedgerAcctId = InterestIncomeId, PartitionKey = "default", Name = "Interest Income", AddedBy = Guid.Parse("742070bd-e68b-45c9-a1f7-021916127731"), Balance = 0, DateAdded = DateTime.Now, Section = "income" }
            );

            builder.Entity<InputLogs>().HasPartitionKey(e => e.Path).ToContainer("AuditLogs");

            builder.Entity<HookConfig>().HasPartitionKey(e => e.Type)
                .HasKey(e => e.NameKey);
						builder.Entity<HookConfig>().ToContainer("HookConfigs");
						builder.Entity<Tag>().ToContainer("Tags").HasPartitionKey(e => e.PartitionKey)
								.HasKey(e => e.Value);
						;


						base.OnModelCreating(builder);
        }



    }

    public static class ServiceExtension
    {

        public static IServiceCollection AddCosmosContext(this IServiceCollection services, ConfigurationManager Configuration)
        {

            string? db = Environment.GetEnvironmentVariable("AppConfig_DatabaseName"); 
            services.AddDbContext<AppDbContext>(opt =>
            {
                var passkey = Environment.GetEnvironmentVariable("ENV_PASSKEY")!;

                var encrypted = Configuration.GetConnectionString("CosmosDb")!;
                var connection = AesOperation.DecryptString(passkey, encrypted);
                opt.UseCosmos(connection, db);
            });

            services.AddScoped<IAccountTypeRepo, AccountTypeRepo>();
            services.AddScoped<IAccountGroupRepo, AccountGroupRepo>();
            services.AddScoped<IAccountRepo, AccountRepo>();
            services.AddScoped<ITransactionRepo, TransactionRepo>();
            services.AddScoped<IAccountBalanceRepo, AccountBalanceRepo>();
            services.AddScoped<IVendorRepo, VendorRepo>();
            services.AddScoped<IDbHelper, DbHelper>();
            services.AddScoped<IScheduledTransactionRepo, ScheduledTransactionRepo>();
            services.AddScoped<IUserRepo, UserRepo>();
            //services.AddScoped<ILoanProfileRepo, LoanProfileRepo>();
            //services.AddScoped<ILoanRepo, LoanRepo>();
            //services.AddScoped<IPaymentRepo, PaymentRepo>();
            //services.AddScoped<IMemberProfileRepo, MemberProfileRepo>();
            //services.AddScoped<ILedgerAcctRepo, LedgerAcctRepo>();
            //services.AddScoped<ILedgerEntryRepo, LedgerEntryRepo>();
            services.AddScoped<IAuditLogRepo, AuditLogRepo>();
            services.AddScoped<IHookMessagesRepo, HookMessagesRepo>();
            services.AddScoped<IMonthlyTransactionRepo, MonthlyTransactionRepo>();
            services.AddScoped<IHookReferenceRepo, HookReferenceRepo>();
            services.AddScoped<IBlobFileRepo, BlobFileRepo>();
            services.AddScoped<IHookConfigRepo, HookConfigRepo>();
            services.AddScoped<ITagRepo, TagRepo>();

						return services;
        }
    }
}
