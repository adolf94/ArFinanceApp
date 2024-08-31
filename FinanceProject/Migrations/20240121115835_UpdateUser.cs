using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
		public partial class UpdateUser : Migration
		{
				protected override void Up(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.DropColumn(
								name: "CurrAmount",
								table: "Transactions");

						migrationBuilder.AlterColumn<string>(
								name: "AzureId",
								table: "Users",
								type: "nvarchar(max)",
								nullable: true,
								oldClrType: typeof(int),
								oldType: "int");

						migrationBuilder.AddColumn<string>(
								name: "Description",
								table: "Transactions",
								type: "nvarchar(max)",
								nullable: false,
								defaultValue: "");
				}

				protected override void Down(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.DropColumn(
								name: "Description",
								table: "Transactions");

						migrationBuilder.AlterColumn<int>(
								name: "AzureId",
								table: "Users",
								type: "int",
								nullable: false,
								defaultValue: 0,
								oldClrType: typeof(string),
								oldType: "nvarchar(max)",
								oldNullable: true);

						migrationBuilder.AddColumn<decimal>(
								name: "CurrAmount",
								table: "Transactions",
								type: "decimal(18,2)",
								nullable: false,
								defaultValue: 0m);
				}
		}
}
