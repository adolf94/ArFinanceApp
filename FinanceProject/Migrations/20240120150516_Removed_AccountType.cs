using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
    public partial class Removed_AccountType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vendors_AccountTypes_AccountTypeId",
                table: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_Vendors_AccountTypeId",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "AccountTypeId",
                table: "Vendors");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AccountTypeId",
                table: "Vendors",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_AccountTypeId",
                table: "Vendors",
                column: "AccountTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Vendors_AccountTypes_AccountTypeId",
                table: "Vendors",
                column: "AccountTypeId",
                principalTable: "AccountTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
