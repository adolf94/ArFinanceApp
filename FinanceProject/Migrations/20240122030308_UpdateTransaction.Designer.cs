﻿// <auto-generated />
using System;
using FinanceProject.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace FinanceProject.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20240122030308_UpdateTransaction")]
    partial class UpdateTransaction
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.16")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder, 1L, 1);

            modelBuilder.Entity("FinanceProject.Models.Account", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid?>("AccountGroupId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<decimal>("Balance")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("CurrBalance")
                        .HasColumnType("decimal(18,2)");

                    b.Property<bool>("Enabled")
                        .HasColumnType("bit");

                    b.Property<decimal>("ForeignExchange")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AccountGroupId");

                    b.ToTable("Accounts");
                });

            modelBuilder.Entity("FinanceProject.Models.AccountGroup", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("AccountTypeId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("Enabled")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("isCredit")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("AccountTypeId");

                    b.ToTable("AccountGroups");
                });

            modelBuilder.Entity("FinanceProject.Models.AccountType", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("Enabled")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("AccountTypes");

                    b.HasData(
                        new
                        {
                            Id = new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"),
                            Enabled = true,
                            Name = "Assets-Main"
                        },
                        new
                        {
                            Id = new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"),
                            Enabled = true,
                            Name = "Expenses-Main"
                        },
                        new
                        {
                            Id = new Guid("04c78118-1131-443f-2fa6-08dac49f6ad4"),
                            Enabled = true,
                            Name = "Income-Main"
                        });
                });

            modelBuilder.Entity("FinanceProject.Models.Transaction", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid?>("AddByUserId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<Guid>("CreditId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("Date")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateAdded")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("DebitId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid?>("VendorId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("AddByUserId");

                    b.HasIndex("CreditId");

                    b.HasIndex("DebitId");

                    b.HasIndex("VendorId");

                    b.ToTable("Transactions");
                });

            modelBuilder.Entity("FinanceProject.Models.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("AzureId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("FinanceProject.Models.Vendor", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("Enabled")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Vendors");
                });

            modelBuilder.Entity("FinanceProject.Models.WeeklyBalance", b =>
                {
                    b.Property<Guid>("AccountId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<decimal>("EndBalance")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("StartBalance")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("AccountId", "StartDate");

                    b.ToTable("WeeklyBalance");
                });

            modelBuilder.Entity("FinanceProject.Models.Account", b =>
                {
                    b.HasOne("FinanceProject.Models.AccountGroup", "AccountGroup")
                        .WithMany("Accounts")
                        .HasForeignKey("AccountGroupId");

                    b.Navigation("AccountGroup");
                });

            modelBuilder.Entity("FinanceProject.Models.AccountGroup", b =>
                {
                    b.HasOne("FinanceProject.Models.AccountType", "AccountType")
                        .WithMany()
                        .HasForeignKey("AccountTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AccountType");
                });

            modelBuilder.Entity("FinanceProject.Models.Transaction", b =>
                {
                    b.HasOne("FinanceProject.Models.User", "AddByUser")
                        .WithMany("Transactions")
                        .HasForeignKey("AddByUserId");

                    b.HasOne("FinanceProject.Models.Account", "Credit")
                        .WithMany("TransactionsAsCredit")
                        .HasForeignKey("CreditId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("FinanceProject.Models.Account", "Debit")
                        .WithMany("TransactionsAsDebit")
                        .HasForeignKey("DebitId")
                        .OnDelete(DeleteBehavior.NoAction)
                        .IsRequired();

                    b.HasOne("FinanceProject.Models.Vendor", "Vendor")
                        .WithMany()
                        .HasForeignKey("VendorId");

                    b.Navigation("AddByUser");

                    b.Navigation("Credit");

                    b.Navigation("Debit");

                    b.Navigation("Vendor");
                });

            modelBuilder.Entity("FinanceProject.Models.WeeklyBalance", b =>
                {
                    b.HasOne("FinanceProject.Models.Account", "Account")
                        .WithMany()
                        .HasForeignKey("AccountId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Account");
                });

            modelBuilder.Entity("FinanceProject.Models.Account", b =>
                {
                    b.Navigation("TransactionsAsCredit");

                    b.Navigation("TransactionsAsDebit");
                });

            modelBuilder.Entity("FinanceProject.Models.AccountGroup", b =>
                {
                    b.Navigation("Accounts");
                });

            modelBuilder.Entity("FinanceProject.Models.User", b =>
                {
                    b.Navigation("Transactions");
                });
#pragma warning restore 612, 618
        }
    }
}
