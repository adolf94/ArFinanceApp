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
				}
				protected override void OnConfiguring(DbContextOptionsBuilder builder)
				{

				}


				protected override void OnModelCreating(ModelBuilder builder)
				{


						builder.Entity<AccountType>()
								.HasData(
												new { Id=new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"), Name="Assets-Main", Enabled=true},
												new { Id=new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"),Name ="Expenses-Main", Enabled=true},
												new { Id= new Guid( "04c78118-1131-443f-2fa6-08dac49f6ad4"), Name= "Income-Main", Enabled= true }
												);



						builder.Entity<Transaction>()
								.HasOne(e => e.Credit).WithMany(e => e.TransactionsAsCredit)
								.OnDelete(DeleteBehavior.NoAction);


						builder.Entity<Transaction>()
								.HasOne(e => e.Debit)
								.WithMany(e=>e.TransactionsAsDebit)
								.OnDelete(DeleteBehavior.NoAction)
								;

						builder.Entity<Transaction>()
								.HasOne(e => e.Vendor)	;

						builder.Entity<WeeklyBalance>().HasKey(bal => new { bal.AccountId, bal.StartDate });

						base.OnModelCreating(builder);
				}



		}
}
