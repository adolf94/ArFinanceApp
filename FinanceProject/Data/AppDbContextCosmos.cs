using FinanceProject.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceProject.Data
{
		public class AppDbContext:DbContext
		{
				public DbSet<Account>? Accounts { get; set; }
				public DbSet<AccountGroup>? AccountGroups { get; set; }
				public DbSet<AccountType>? AccountTypes { get; set; }
				public DbSet<Transaction>? Transactions { get; set; }
				public DbSet<User>? Users { get; set; }
				public DbSet<Vendor>? Vendors { get; set; }

				private readonly IConfiguration _configuration;
				public AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration config) : base(options)

				{
						_configuration = config;
						base.Database.EnsureCreated();
				}


				protected override void OnModelCreating(ModelBuilder builder)
				{

						builder.Entity<AccountType>()
								.ToContainer("AccountType").HasPartitionKey(e => e.Id)
								.HasPartitionKey(e=>e.Id);

						builder.Entity<AccountType>()
								.HasData(
												new { Id=new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"), Name="Assets-Main", Enabled=true},
												new { Id=new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"),Name ="Expenses-Main", Enabled=true},
												new { Id= new Guid( "04c78118-1131-443f-2fa6-08dac49f6ad4"), Name= "Income-Main", Enabled= true }
												);

						builder.Entity<AccountGroup>()
								.ToContainer("AccountGroup").HasPartitionKey(e => e.Id);

						builder.Entity<Account>()
								.ToContainer("Account").HasPartitionKey(e => e.Id)
								.HasOne(e => e.AccountGroup);



						builder.Entity<Transaction>()
								.ToContainer("Transaction").HasPartitionKey(e => e.Id)
								.HasOne(e => e.Credit).WithMany(e => e.TransactionsAsCredit);


						builder.Entity<Transaction>().HasPartitionKey(e => e.Id)
								.HasOne(e => e.Debit).WithMany(e=>e.TransactionsAsDebit);

						builder.Entity<Transaction>().HasPartitionKey(e => e.Id)
								.HasOne(e => e.Vendor)
								;


						builder.Entity<Vendor>().HasPartitionKey(e => e.Id)
								.ToContainer("Vendor")
								.HasKey(e => e.Id);

						builder.Entity<User>().HasPartitionKey(e => e.Id)
								.ToContainer("User")
								.HasKey(e => e.Id);


						base.OnModelCreating(builder);
				}



		}
}
