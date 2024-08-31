using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
		/// <inheritdoc />
		public partial class AddUserInfoAndConfigs : Migration
		{
				/// <inheritdoc />
				protected override void Up(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.AddColumn<string>(
								name: "EmailAddress",
								table: "Users",
								type: "nvarchar(max)",
								nullable: false,
								defaultValue: "");

						migrationBuilder.AddColumn<string>(
								name: "MobileNumber",
								table: "Users",
								type: "nvarchar(max)",
								nullable: false,
								defaultValue: "");

						migrationBuilder.AddColumn<DateTime>(
								name: "LastTransactionDate",
								table: "ScheduledTransactions",
								type: "datetime2",
								nullable: false,
								defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

						migrationBuilder.AddColumn<int>(
								name: "LastTransactionIndex",
								table: "ScheduledTransactions",
								type: "int",
								nullable: false,
								defaultValue: 0);

						migrationBuilder.AddColumn<DateTime>(
								name: "NextTransactionDate",
								table: "ScheduledTransactions",
								type: "datetime2",
								nullable: false,
								defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

						migrationBuilder.AddColumn<int>(
								name: "TotalOccurence",
								table: "ScheduledTransactions",
								type: "int",
								nullable: false,
								defaultValue: 0);

						migrationBuilder.CreateIndex(
								name: "IX_ScheduledTransactions_LastTransactionDate",
								table: "ScheduledTransactions",
								column: "LastTransactionDate",
								descending: new bool[0]);

						migrationBuilder.CreateIndex(
								name: "IX_ScheduledTransactions_NextTransactionDate",
								table: "ScheduledTransactions",
								column: "NextTransactionDate",
								descending: new bool[0]);
				}

				/// <inheritdoc />
				protected override void Down(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.DropIndex(
								name: "IX_ScheduledTransactions_LastTransactionDate",
								table: "ScheduledTransactions");

						migrationBuilder.DropIndex(
								name: "IX_ScheduledTransactions_NextTransactionDate",
								table: "ScheduledTransactions");

						migrationBuilder.DropColumn(
								name: "EmailAddress",
								table: "Users");

						migrationBuilder.DropColumn(
								name: "MobileNumber",
								table: "Users");

						migrationBuilder.DropColumn(
								name: "LastTransactionDate",
								table: "ScheduledTransactions");

						migrationBuilder.DropColumn(
								name: "LastTransactionIndex",
								table: "ScheduledTransactions");

						migrationBuilder.DropColumn(
								name: "NextTransactionDate",
								table: "ScheduledTransactions");

						migrationBuilder.DropColumn(
								name: "TotalOccurence",
								table: "ScheduledTransactions");
				}
		}
}
