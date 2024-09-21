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
                    "/Id"
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
