const {v4: uuid, v7: uuid7} = require('uuid');
const moment = require('moment');

const data = {

  rollback :{

  },
  migrate : {
	database : [
	  {
		"Container": "__EfMigrations",
		"PartitionKeyPath": "/Id",
		mapper: e=>e
	  },
	  {
		"Container": "Account",
		"PartitionKeyPath": "/Id",
		mapper: e=>e
	  },
	  {
		"Container": "AccountBalance",
		"PartitionKeyPaths": [
		  '/Year','/Month','/AccountId'
		],
		mapper: e=>e
	  },
	  {
		"Container": "AccountGroup",
		"PartitionKeyPath": "/Id",
		mapper: e=>e
	  },
	  {
		"Container": "AccountType",
		"PartitionKeyPath": "/Id",
		mapper: e=>e
	  },
	{
		"Container": "AuditLogs",
		"PartitionKeyPath": "/Guid",
		mapper: e=>e
	},
	  {
		"Container": "CoopOption",
		"PartitionKeyPaths":["/AppId","/Year"],
		mapper: e=>e
	  },
	  {
		"Container":"ScheduledTransactions",
		"PartitionKeyPath":"/Id",
		mapper: e=>e
	  },
	  {
		"Container": "LoanPayments",
		"PartitionKeyPaths": ["/AppId", "/UserId", "/LoanId"],
		mapper: e=>e
	  },
	  {
		"Container": "LedgerEntries",
		"PartitionKeyPath": "/MonthGroup",
		mapper: e=>e
	  },
	  {
		"Container": "LedgerAccounts",
		"PartitionKeyPaths": ["/Section", "/LedgerAcctId"],
		mapper: e=>e
	  },
	  {
		"Container": "LoanProfiles",
		"PartitionKeyPaths": ["/AppId", "/ProfileId"],
		mapper: e=>e
	  },
	  {
		"Container": "Loans",
		"PartitionKeyPaths":["/AppId", "/UserId","/Status"],
		mapper: e=>e
	  },
	  {
		"Container": "MemberProfiles",
		"PartitionKeyPaths":["/AppId", "/Year", "/UserId"],
		mapper: e=>e
	  },
	  {
		"Container": "Payments",
		"PartitionKeyPaths":["/AppId", "/UserId", "/Id"],
		mapper: e=>e
	  },
	  {
		"Container":"Transaction",
		"PartitionKeyPath":"/Id",
		mapper: e=>e
	  },
	  {
		"Container":"User",
		"PartitionKeyPath":"/Id"
	  },
	  {
		"Container":"Vendor",
		"PartitionKeyPath":"/Id",
		mapper: e=>e
	  }
	]
  },
  dataMigration:(db)=>{
	let userId = db.User[0].Id
	let receivables = db.User.reduce((prev,e,i)=>{
	  	let ledgerAccount = {

		  AddedBy : e.Id,
		  DateAdded : moment().format("YYYY-MM-DDTHH:mm:ss"),
		  Balance : 0,
		  LedgerAcctId : uuid7(),
		  Discriminator:"LedgerAccount",
		  Name : `Rcvb - ${e.Name}`,
		  Section : "receivables"
		}  
		e.AcctReceivableId = ledgerAccount.LedgerAcctId;
		return [...prev,ledgerAccount]
	},[])
	
	
	//Add default AssetId 
	let CashAsset = {
	  LedgerAcctId: '0193d2dd-3bfe-7990-99a2-b6e8ebec289b',
	  DateAdded: moment().toISOString(),
	  AddedBy:  userId,
	  Discriminator:"LedgerAccount",
	  Name: "Cash",
	  Section:"assets",
	  Balance:0
	}
	let IncomeAsset = {
	  LedgerAcctId: "742070bd-e68b-45c9-a1f7-021916127731",
	  DateAdded : moment().toISOString(),
	  Discriminator:"LedgerAccount",
	  AddedBy:  userId,
	  Name: "Interest Income",
	  Section:"income",
	  Balance:0
	}
	
	db.LedgerAccounts = [CashAsset,IncomeAsset, ...receivables]
	
	
	const addLedgerEntry = (entry)=>{
	  let debit = db.LedgerAccounts.find(e=>e.LedgerAcctId === entry.DebitId)
	  let credit = db.LedgerAccounts.find(e=>e.LedgerAcctId === entry.CreditId)


	  debit.Balance += entry.Amount
	  credit.Balance -= entry.Amount
	  db.LedgerEntries.push({Discriminator:"LedgerEntry", ...entry})
	}
	
	
	db.Loans.forEach((loan, i)=>{
	  let user = db.User.find(e=>loan.UserId === e.Id)
	  let newEntry = {
		EntryId : uuid7(),
		EntryGroupId : uuid7(),
		AddedBy : loan.CreatedBy,
		CreditId : CashAsset.LedgerAcctId,
		DebitId :user.AcctReceivableId,
		Amount : loan.Principal,
		DateAdded: loan.DateCreated,
		Date : loan.Date,
		MonthGroup : moment(loan.Date).format("yyyy-MM"),
		Discriminator: "LedgerEntry",
		RelatedEntries :
		  [
			{ TransactionId : loan.Id, Type : "loan" }
		  ],
		Description : `Loan Principal for Client ${user.Name}. Date: ${loan.Date}`
	  }
	  db.Loans[i].LedgerEntryId = newEntry.EntryId;
	  addLedgerEntry(newEntry)
	  
	  loan.InterestRecords.forEach((interest, i)=>{

		let intEntry = {
		  EntryId : uuid7(),
		  EntryGroupId : loan.LedgerEntryId,
		  AddedBy : loan.CreatedBy,
		  CreditId : IncomeAsset.LedgerAcctId,
		  DebitId :user.AcctReceivableId,
		  Amount : interest.Amount,
		  DateAdded: moment().toISOString(),
		  Date : interest.DateStart,
		  MonthGroup : moment(loan.DateStart).format("yyyy-MM"),
		  RelatedEntries :
			[
			  { TransactionId : loan.Id, Type : "loan" }
			],
		  Description : `Added Interest (${loan.LoanProfile.InterestFactor})`
		}
		addLedgerEntry(intEntry)
		
		loan.InterestRecords[i].LedgerEntryId = intEntry.EntryId;
	  })
	  
	  
	  
	})

	db.Payments.forEach((payment,i)=>{
	  let user = db.User.find(e=>payment.UserId === e.Id)
	  let uid = uuid7()
	  let entry = {
		EntryId : uid,
		EntryGroupId : uid,
		AddedBy : payment.AddedBy  || userId,
		CreditId : user.AcctReceivableId,
		DebitId : CashAsset.LedgerAcctId,
		Amount : payment.Amount,
		DateAdded: payment.DateAdded,
		Date : payment.Date,
		MonthGroup : moment(payment.Date).format("yyyy-MM"),
		RelatedEntries :
		  [
			{ TransactionId : payment.Id, Type : "payment" }
		  ],
		Description : `Received payment from Client ${user.Name}`
	  }
	  addLedgerEntry(entry)
		payment.LedgerEntryId = entry.EntryId;
	})
	
	
	//add accounts for equity
	//update account balance  
	return db
  },
  state : [
	{
	  "Container": "__EfMigrations",
	  "PartitionKeyPath": "/Id"
	},
	{
	  "Container": "Account",
	  "PartitionKeyPath": "/Id"
	},
	{
	  "Container": "AccountBalance",
	  "PartitionKeyPaths": [
		"/Year",
		"/Month",
		"/AccountId"
	  ]
	},
	{
	  "Container": "AccountGroup",
	  "PartitionKeyPath": "/Id"
	},
	{
	  "Container": "AccountType",
	  "PartitionKeyPath": "/Id"
	},
	{
	  "Container": "LoanPayments",
	  "PartitionKeyPaths": ["/AppId", "/UserId", "/LoanId"],
	},
	{
	  "Container": "LoanPayments",
	  "PartitionKeyPaths": ["/AppId", "/ProfileId"],
	},
	{
	  "Container": "Loans",
	  comment : "new"
	},
	{
	  "Container": "Payments",
	  "PartitionKeyPaths":["/AppId", "/UserId", "/Id"],
	},
	{
	  "Container":"ScheduledTransactions",
	  "PartitionKeyPath":"/Id"
	},
	{
	  "Container":"Transaction",
	  "PartitionKeyPath":"/Id"
	},
	{
	  "Container":"User",
	  "PartitionKeyPath":"/Id"
	},
	{
	  "Container":"Vendor",
	  "PartitionKeyPath":"/Id"
	}
  ]
}


module.exports = data
