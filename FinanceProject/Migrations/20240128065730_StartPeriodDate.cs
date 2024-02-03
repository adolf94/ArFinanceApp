using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
    public partial class StartPeriodDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PeriodStartDay",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ResetEndOfPeriod",
                table: "Accounts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql("Update Accounts Set PeriodStartDay = 1, ResetEndOfPeriod = 0");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PeriodStartDay",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "ResetEndOfPeriod",
                table: "Accounts");
        }
    }
}
