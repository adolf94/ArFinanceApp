using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceProject.Migrations
{
		public partial class Initial : Migration
		{
				protected override void Up(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.CreateTable(
								name: "AccountTypes",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
										Enabled = table.Column<bool>(type: "bit", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_AccountTypes", x => x.Id);
								});

						migrationBuilder.CreateTable(
								name: "Users",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										UserName = table.Column<string>(type: "nvarchar(max)", nullable: true),
										AzureId = table.Column<int>(type: "int", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_Users", x => x.Id);
								});

						migrationBuilder.CreateTable(
								name: "AccountGroups",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
										Enabled = table.Column<bool>(type: "bit", nullable: false),
										AccountTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_AccountGroups", x => x.Id);
										table.ForeignKey(
												name: "FK_AccountGroups_AccountTypes_AccountTypeId",
												column: x => x.AccountTypeId,
												principalTable: "AccountTypes",
												principalColumn: "Id",
												onDelete: ReferentialAction.Cascade);
								});

						migrationBuilder.CreateTable(
								name: "Vendors",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
										AccountTypeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Enabled = table.Column<bool>(type: "bit", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_Vendors", x => x.Id);
										table.ForeignKey(
												name: "FK_Vendors_AccountTypes_AccountTypeId",
												column: x => x.AccountTypeId,
												principalTable: "AccountTypes",
												principalColumn: "Id",
												onDelete: ReferentialAction.Cascade);
								});

						migrationBuilder.CreateTable(
								name: "Accounts",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
										Enabled = table.Column<bool>(type: "bit", nullable: false),
										AccountGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
										ForeignExchange = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
										Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
										CurrBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_Accounts", x => x.Id);
										table.ForeignKey(
												name: "FK_Accounts_AccountGroups_AccountGroupId",
												column: x => x.AccountGroupId,
												principalTable: "AccountGroups",
												principalColumn: "Id");
								});

						migrationBuilder.CreateTable(
								name: "Transactions",
								columns: table => new
								{
										Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										CreditId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										DebitId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
										CurrAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
										AddByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
										VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
										Date = table.Column<DateTime>(type: "datetime2", nullable: false),
										DateAdded = table.Column<DateTime>(type: "datetime2", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_Transactions", x => x.Id);
										table.ForeignKey(
												name: "FK_Transactions_Accounts_CreditId",
												column: x => x.CreditId,
												principalTable: "Accounts",
												principalColumn: "Id");
										table.ForeignKey(
												name: "FK_Transactions_Accounts_DebitId",
												column: x => x.DebitId,
												principalTable: "Accounts",
												principalColumn: "Id");
										table.ForeignKey(
												name: "FK_Transactions_Users_AddByUserId",
												column: x => x.AddByUserId,
												principalTable: "Users",
												principalColumn: "Id");
										table.ForeignKey(
												name: "FK_Transactions_Vendors_VendorId",
												column: x => x.VendorId,
												principalTable: "Vendors",
												principalColumn: "Id");
								});

						migrationBuilder.CreateTable(
								name: "WeeklyBalance",
								columns: table => new
								{
										AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
										StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
										StartBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
										EndBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
								},
								constraints: table =>
								{
										table.PrimaryKey("PK_WeeklyBalance", x => new { x.AccountId, x.StartDate });
										table.ForeignKey(
												name: "FK_WeeklyBalance_Accounts_AccountId",
												column: x => x.AccountId,
												principalTable: "Accounts",
												principalColumn: "Id",
												onDelete: ReferentialAction.Cascade);
								});

						migrationBuilder.InsertData(
								table: "AccountTypes",
								columns: new[] { "Id", "Enabled", "Name" },
								values: new object[] { new Guid("04c78118-1131-443f-2fa6-08dac49f6ad4"), true, "Income-Main" });

						migrationBuilder.InsertData(
								table: "AccountTypes",
								columns: new[] { "Id", "Enabled", "Name" },
								values: new object[] { new Guid("892f20e5-b8dc-42b6-10c9-08dabb20ff77"), true, "Assets-Main" });

						migrationBuilder.InsertData(
								table: "AccountTypes",
								columns: new[] { "Id", "Enabled", "Name" },
								values: new object[] { new Guid("a68ebd61-ce5d-4c99-10ca-08dabb20ff77"), true, "Expenses-Main" });

						migrationBuilder.CreateIndex(
								name: "IX_AccountGroups_AccountTypeId",
								table: "AccountGroups",
								column: "AccountTypeId");

						migrationBuilder.CreateIndex(
								name: "IX_Accounts_AccountGroupId",
								table: "Accounts",
								column: "AccountGroupId");

						migrationBuilder.CreateIndex(
								name: "IX_Transactions_AddByUserId",
								table: "Transactions",
								column: "AddByUserId");

						migrationBuilder.CreateIndex(
								name: "IX_Transactions_CreditId",
								table: "Transactions",
								column: "CreditId");

						migrationBuilder.CreateIndex(
								name: "IX_Transactions_DebitId",
								table: "Transactions",
								column: "DebitId");

						migrationBuilder.CreateIndex(
								name: "IX_Transactions_VendorId",
								table: "Transactions",
								column: "VendorId");

						migrationBuilder.CreateIndex(
								name: "IX_Vendors_AccountTypeId",
								table: "Vendors",
								column: "AccountTypeId");
				}

				protected override void Down(MigrationBuilder migrationBuilder)
				{
						migrationBuilder.DropTable(
								name: "Transactions");

						migrationBuilder.DropTable(
								name: "WeeklyBalance");

						migrationBuilder.DropTable(
								name: "Users");

						migrationBuilder.DropTable(
								name: "Vendors");

						migrationBuilder.DropTable(
								name: "Accounts");

						migrationBuilder.DropTable(
								name: "AccountGroups");

						migrationBuilder.DropTable(
								name: "AccountTypes");
				}
		}
}
