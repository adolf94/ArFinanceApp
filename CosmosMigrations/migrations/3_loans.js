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
                "Container": "CoopOption",
                "PartitionKeyPaths":["/AppId","/Year"],
                mapper: e=>e
            },
            {
                "Container":"ScheduledTransactions",
                "PartitionKeyPaths":[
                    "/AppId", "/UserId", "/Id"
                ],
                comment:"new",
                mapper: e=>e
            },
            {
                "Container": "LoanPayments",
                "PartitionKeyPaths": ["/AppId", "/UserId", "/LoanId"],
                comment : "new",
                mapper: e=>e
            },
            {
                "Container": "LoanProfile",
                "PartitionKeyPaths": ["/AppId", "/ProfileId"],
                comment : "new",
                mapper: e=>e
            },
            {
                "Container": "Loans",
                "PartitionKeyPaths":["/AppId", "/UserId", "/Status"],
                comment : "new",
                mapper: e=>e
            },
            {
                "Container": "MemberProfiles",
                "PartitionKeyPaths":["/AppId", "/Year", "/UserId"],
                comment : "new",
                mapper: e=>e
            },
            {
                "Container": "Payments",
                "PartitionKeyPaths":["/AppId", "/UserId", "/Id"],
                comment : "new",
                mapper: e=>e
            },
            {
                "Container":"Transaction",
                "PartitionKeyPath":"/Id",
                mapper: e=>e
              },
              {
                "Container":"User",
                "PartitionKeyPath":"/Id",
                mapper: e=>{
                    e.HasActiveLoans = false
                    e.LoanProfile = null
                    e.roles = e.roles.map(e=>e.toUpperCase())
                    e.LoanProfileProfileId = null
                    e.DisbursementAccounts = []
                    return e;
                }
              },
              {
                "Container":"Vendor",
                "PartitionKeyPath":"/Id",
                mapper: e=>e
              }
        ]
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
            comment : "new"
        },
        {
            "Container": "LoanPayments",
            "PartitionKeyPaths": ["/AppId", "/ProfileId"],
            comment : "new"
        },
        {
            "Container": "Loans",
            "PartitionKeyPaths":["/AppId", "/UserId", "/Id"],
            comment : "new"
        },
        {
            "Container": "Payments",
            "PartitionKeyPaths":["/AppId", "/UserId", "/Id"],
            comment : "new"
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
