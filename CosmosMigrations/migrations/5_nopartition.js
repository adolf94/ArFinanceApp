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
		mapper: e=> e
	  },
	  {
		"Container": "Account",
		"PartitionKeyPath": "/PartitionKey",
		  mapper: e=> (
			  {...e, PartitionKey:'default', id:e.Id}
		  )
	  },
	  {
		"Container": "AccountBalance",
		"PartitionKeyPath": "/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default'}
		)
	  },
	  {
		"Container": "AccountGroup",
		"PartitionKeyPath": "/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default', id:e.Id}
		)
	  },
	  {
		"Container": "AccountType",
		"PartitionKeyPath": "/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default', id:e.Id}
		)
	  },
	{
		"Container": "AuditLogs",
		"PartitionKeyPath": "/Path",
		mapper: e=>e
	},
	  {
		"Container": "CoopOption",
		"PartitionKeyPaths":["/AppId"],
		mapper: e=>e
	  },
	  {
		"Container":"ScheduledTransactions",
		"PartitionKeyPath":"/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default'}
		)
	  },
	  {
		"Container": "LoanPayments",
		"PartitionKeyPaths": ["/AppId"],
		mapper: e=>e
	  },
	  {
		"Container": "LedgerEntries",
		"PartitionKeyPath": "/MonthGroup",
		mapper: e=>e
	  },
	  {
		"Container": "LedgerAccounts",
		"PartitionKeyPaths": ["/PartitionKey"],
		mapper: e=> (
		  {...e, PartitionKey:'default'}
		)
	  },
	  {
		"Container": "LoanProfiles",
		"PartitionKeyPaths": ["/AppId"],
		mapper: e=>({...e, id:e.ProfileId})
	  },
	  {
		"Container": "Loans",
		"PartitionKeyPaths":["/AppId"],
		mapper: e=>e
	  },
	  {
		"Container": "MemberProfiles",
		"PartitionKeyPaths":["/AppId"],
		mapper: e=>e
	  },
	  {
		"Container": "Payments",
		"PartitionKeyPaths":["/AppId"],
		mapper: e=>({
		  ...e, id:e.Id
		})
	  },
	  {
		"Container":"Transaction",
		"PartitionKeyPath":"/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default', id:e.Id}
		)
	  },
	  {
		"Container":"User",
		"PartitionKeyPath":"/PartitionKey",
		mapper: e=> (
		  {...e, PartitionKey:'default', id:e.Id}
		)
	  },
	  {
		"Container":"Vendor",
		"PartitionKeyPath":"/Id",
		mapper: e=> (
		  {...e, PartitionKey:'default', id:e.Id}
		)
	  }
	]
  },
  dataMigration:(db)=>{
	
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
