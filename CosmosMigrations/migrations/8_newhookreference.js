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
        mapper: e=> ({...e,id:"Account|"+e.Id})
      },
      {
        "Container": "AccountBalance",
        "PartitionKeyPath": "/PartitionKey"
      },
      {
        "Container": "AccountGroup",
        "PartitionKeyPath": "/PartitionKey",
        mapper: e=> ({...e, id: `AccountGroup|${e.Id}`})
      },
      {
        "Container": "AccountType",
        "PartitionKeyPath": "/PartitionKey"
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
        "PartitionKeyPath":"/PartitionKey"
      },
      {
        "Container": "LoanPayments",
        "PartitionKeyPaths": ["/AppId"],
        mapper: e=>e
      },
      {
        "Container": "HookMessages",
        "PartitionKeyPaths": ["/PartitionKey"],
          mapper: e => ({ ...e, Status: "New", TransactionId:null})
      },
      {
        "Container": "LedgerEntries",
        "PartitionKeyPath": "/MonthGroup",
        mapper: e=>e
      },
      {
        "Container": "LedgerAccounts",
        "PartitionKeyPaths": ["/PartitionKey"]
      },
      {
        "Container": "LoanProfiles",
        "PartitionKeyPaths": ["/AppId"]
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
        "PartitionKeyPaths":["/AppId"]
      },
      {
        "Container":"Transaction",
        "PartitionKeyPath":"/PartitionKey",
          mapper: e => ({ ...e, MonthKey: moment(e.Date).format("YYYY-MM-01"), Notifications :[]})
      },
      {
        "Container":"User",
        "PartitionKeyPath":"/PartitionKey"
      },
      {
        "Container":"Vendor",
        "PartitionKeyPath":"/PartitionKey"
      },
      {
        "Container":"MonthTransactions",
        "PartitionKeyPath":"/PartitionKey"
      },
      {
        "Container":"HookReferences",
        "PartitionKeyPath":"/PartitionKey"
      }
    ]
  },
  dataMigration:(db)=>{
    
    
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
