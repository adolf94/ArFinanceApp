using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
    public partial class ForModifiedBalance : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountBalances",
                columns: table => new
                {
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Account = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountBalances", x => new { x.AccountId, x.Month, x.Year });
                });

            migrationBuilder.InsertData(
                table: "AccountGroups",
                columns: new[] { "Id", "AccountTypeId", "Enabled", "Name", "isCredit" },
                values: new object[] { new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), false, "Adjustments", false });

            migrationBuilder.InsertData(
                table: "AccountTypes",
                columns: new[] { "Id", "Enabled", "Name" },
                values: new object[] { new Guid("5b106232-530c-42d7-8d55-b4be282e8297"), false, "Others-Main" });

            migrationBuilder.InsertData(
                table: "Accounts",
                columns: new[] { "Id", "AccountGroupId", "Balance", "CurrBalance", "Enabled", "ForeignExchange", "Name" },
                values: new object[] { new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"), new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"), 0.00m, 0m, false, 0m, "Adjustments" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountBalances");

            migrationBuilder.DeleteData(
                table: "AccountTypes",
                keyColumn: "Id",
                keyValue: new Guid("5b106232-530c-42d7-8d55-b4be282e8297"));

            migrationBuilder.DeleteData(
                table: "Accounts",
                keyColumn: "Id",
                keyValue: new Guid("747b7bd2-1a50-4e7c-8b27-01e5fa8fd6a4"));

            migrationBuilder.DeleteData(
                table: "AccountGroups",
                keyColumn: "Id",
                keyValue: new Guid("9750a38b-057b-4ab8-9eea-d196041c55cb"));
        }
    }
}
