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
                    "/Year",
                    "/Month",
                    "/AccountId"
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
            "Container":"ScheduledTransactions",
            "PartitionKeyPath":"/Id",
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
                mapper: e=>e
              },
              {
                "Container":"Vendor",
                "PartitionKeyPath":"/Id",
                mapper: e=>e
              }
        ]
    }

}


module.exports = data
