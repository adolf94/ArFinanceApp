using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
		public partial class ScheduleTransactions : Migration
		{
				protected override void Up(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.AddColumn<Guid>(
								name: "ScheduleId",
								table: "Transactions",
								type: "uniqueidentifier",
								nullable: true);

						migrationBuilder.CreateTable(
								name: "ScheduledTransactions",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										CronExpression = table.Column<string>(type: "nvarchar(max)", nullable: false),
										CronId = table.Column<string>(type: "nvarchar(max)", nullable: false),
										LastTransactionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
										EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
										DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
										Enabled = table.Column<bool>(type: "bit", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_ScheduledTransactions", x => x.Id);
										table.ForeignKey(
												name: "FK_ScheduledTransactions_Transactions_LastTransactionId",
												column: x => x.LastTransactionId,
												principalTable: "Transactions",
												principalColumn: "Id");
								});

						migrationBuilder.CreateIndex(
								name: "IX_Transactions_ScheduleId",
								table: "Transactions",
								column: "ScheduleId");

						migrationBuilder.CreateIndex(
								name: "IX_ScheduledTransactions_LastTransactionId",
								table: "ScheduledTransactions",
								column: "LastTransactionId",
								unique: true,
								filter: "[LastTransactionId] IS NOT NULL");

						migrationBuilder.AddForeignKey(
								name: "FK_Transactions_ScheduledTransactions_ScheduleId",
								table: "Transactions",
								column: "ScheduleId",
								principalTable: "ScheduledTransactions",
								principalColumn: "Id");
				}

				protected override void Down(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.DropForeignKey(
								name: "FK_Transactions_ScheduledTransactions_ScheduleId",
								table: "Transactions");

						migrationBuilder.DropTable(
								name: "ScheduledTransactions");

						migrationBuilder.DropIndex(
								name: "IX_Transactions_ScheduleId",
								table: "Transactions");

						migrationBuilder.DropColumn(
								name: "ScheduleId",
								table: "Transactions");
				}
		}
}
