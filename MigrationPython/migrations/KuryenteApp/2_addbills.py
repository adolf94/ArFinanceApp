from datetime import datetime, timedelta, timezone
import json
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from functools import reduce



def up_migration(db):
    print("TEST SUCCESS")
    return db


def reset_ledgers(db):

    return db




def table_metadata():
    return [
        {
            "Container": "__EfMigrations",
            "PartitionKeyPath": "/Id",
            "mapper" : lambda e : e
        },
        {
            "Container": "PaymentsUploads",
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : ({**e})
        },
        {
            "Container": "StatusCheckpoint",
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "Readings",
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : {**e }
        },
        {
            "Container": "Bills",
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : {**e }
        }
    ]
     
      
 
     