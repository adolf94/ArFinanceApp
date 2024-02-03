using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
    public partial class ChangeToDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_AccountBalances",
                table: "AccountBalances");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "AccountBalances");

            migrationBuilder.DropColumn(
                name: "Account",
                table: "AccountBalances");

						migrationBuilder.DropColumn(
								name: "Month",
								table: "AccountBalances"
								);

						migrationBuilder.AddColumn<DateTime>(
								name: "Month",
								table: "AccountBalances",
								type: "datetime2",
								nullable: false
								);

						migrationBuilder.AddPrimaryKey(
                name: "PK_AccountBalances",
                table: "AccountBalances",
                columns: new[] { "AccountId", "Month" });

            migrationBuilder.AddForeignKey(
                name: "FK_AccountBalances_Accounts_AccountId",
                table: "AccountBalances",
                column: "AccountId",
                principalTable: "Accounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AccountBalances_Accounts_AccountId",
                table: "AccountBalances");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AccountBalances",
                table: "AccountBalances");

            migrationBuilder.AlterColumn<int>(
                name: "Month",
                table: "AccountBalances",
                type: "int",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "AccountBalances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "Account",
                table: "AccountBalances",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_AccountBalances",
                table: "AccountBalances",
                columns: new[] { "AccountId", "Month", "Year" });
        }
    }
}
