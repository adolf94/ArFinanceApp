from datetime import datetime, timedelta, timezone
import json
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from functools import reduce



def up_migration():
    print("TEST SUCCESS")
    # return db


def reset_ledgers(db):

    print("get min and max dates")
    def reduceMinMax(p,c):
        currentDate = parse(c["Date"]).replace(tzinfo=None)
        if currentDate < p["min"]: p["min"] = currentDate
        if currentDate > p["max"]: p["max"] = currentDate
        return p    

    minMax = reduce( reduceMinMax, db["Transaction"], {"min":datetime(2025,2,1), "max":datetime(2000,1,1)} )
    minMax = {
        "min": (minMax["min"] + relativedelta(months=-1)).strftime("%Y-%m-01"),
        "max": (minMax["max"]).strftime("%Y-%m-01"),
        }

    print("set min and max dates")
    db["Account"] = list(map(lambda acct : {**acct,
                                       "MinMonth":minMax["min"], 
                                       "MaxMonth":minMax["max"], 
                                       "Balance":0, "CurrBalance":0}, 
                                       db["Account"]))
    print("generate balances")

    def create_acct_balances(p,c):
        month = parse(c["MinMonth"]).replace(tzinfo=None)
        while month <= parse(c["MaxMonth"]).replace(tzinfo=None):
            currentKey = f"{month.strftime("%Y|%m")}|{c["id"]}"
            item = {
                "AccountId": c["id"],
                "id": currentKey,
                "$type": "AccountBalance",
                "Year": month.year,
                "Month": month.month,
                "DateStart": month.replace(day=c["PeriodStartDay"]).strftime("%Y-%m-&d"),
                "DateEnd": (month.replace(day=c["PeriodStartDay"]) + relativedelta(months=1)).strftime("%Y-%m-&d"),
                "Balance": 0,
                "EndingBalance": 0,
                "PartitionKey": "default",
                "Transactions": []
            }
            p.append(item)
            month = month + relativedelta(months=1)
        return p

    acctBals = reduce(create_acct_balances, db["Account"],[])

    print("generating month balances")
    balance = []
    month = parse(minMax["min"]).replace(tzinfo=None)
    while month <= parse(minMax["max"]).replace(tzinfo=None):
        newitem = {
            "id": f"MonthlyTransaction|{month.strftime("%Y-%m-01")}",
            "MonthKey": month.strftime("%Y-%m-01"),
            "PartitionKey": "default",
            "$type": "MonthlyTransaction",
            "Transactions":[]
        }
        balance.append(newitem)
        month = month + relativedelta(months=1)
    db["MonthTransactions"] = balance

    monthKeys = reduce(lambda p,c: ({**p,c["MonthKey"]: c}),
                       db["MonthTransactions"] ,
                       {})
    
    AccountDictionary = reduce(lambda p,c: ({**p, c["Id"]:c}), 
                               db["Account"],
                                {})

    BalanceDictionary = reduce(lambda p,c: {**p, c["id"]:c}, 
                               acctBals,
                               {})
    
    def updateAcct(acctId, amount):
        acctToUpdate = AccountDictionary[acctId]
        acctToUpdate["Balance"] += amount

    def updateMonthBal(transactionId, date, epoch): 
        monthKey = parse(date).replace(day=1).strftime("%Y-%m-01")
        monthbal = monthKeys[monthKey]
        monthbal["Transactions"].append({
			"Id": transactionId,
			"EpochUpdated":epoch 
		})

    def updateBalances (transactionId, acctId,date,epoch, amount):
        acct = AccountDictionary[acctId]
        isPrevPeriod = parse(date).day < acct["PeriodStartDay"]
        addMonth = -1 if isPrevPeriod == True else 0
        period = parse(date) + relativedelta(months=addMonth)

        key = f"{period.strftime("%Y|%m")}|{acctId}"

        try:
            curBalance = BalanceDictionary[key]
            curBalance["EndingBalance"] += amount
            curBalance["Transactions"].append({
				"TransactionId": transactionId, 
				"Amount": amount,
				"EpochUpdated": epoch
			})
        except Exception as ex:
            print(f"Missing in dictionary:{key}")
            raise ex
        
        for b in acctBals:
            if b["AccountId"] == acctId and b["id"] > key:
                b["Balance"] += amount
                b["EndingBalance"] += amount
        return key
    
    for tran in db["Transaction"]:
        tran["EpochUpdated"] = parse(tran["DateAdded"]).timestamp()
        tran["MonthKey"] = parse(tran["Date"]).strftime("%Y-%m-01")

        updateMonthBal(tran["id"], tran["Date"], tran["EpochUpdated"])

        updateAcct(tran["DebitId"], tran["Amount"])
        debitKey = updateBalances(tran["id"], tran["DebitId"], tran["Date"], tran["EpochUpdated"]
                                  , tran["Amount"])

        updateAcct(tran["CreditId"], -tran["Amount"])
        creditKey = updateBalances(tran["id"], tran["CreditId"], tran["Date"], tran["EpochUpdated"]
                                  , tran["Amount"])
        
        tran["BalanceRefs"] = [
            {
                "AccountId": tran["DebitId"],
                "AccountBalanceKey": debitKey,
                "IsDebit": True
            },
            {
                "AccountId": tran["CreditId"],
                "AccountBalanceKey": creditKey,
                "IsDebit": False
            }
        ]

    AuditLogs = []
    for e in db["AuditLogs"]:
        if datetime.now(timezone.utc) < (parse(e["DateLogged"]) + relativedelta(months=1)):
            time_diff = (parse(e["DateLogged"]) + relativedelta(months=1)) - datetime.now(timezone.utc)
            e["_ttl"] = time_diff.total_seconds()
            AuditLogs.append(e)
    db["AuditLogs"] = AuditLogs
    

    db["HookMessages"] = list(map(lambda e: {**e,"Status": "New", "TransactionId":None, "MonthKey":parse(e["Date"]).strftime("%Y-%m-01")}, db["HookMessages"]))

    return db


def table_metadata():
    return [
        {
            "Container": "__EfMigrations",
            "PartitionKeyPath": "/Id",
            "mapper" : lambda e : e
        },
        {
            "Container": "Account",
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : ({**e})
        },
        {
            "Container": "AccountBalance",
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "AccountGroup",
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : {**e }
        },
        {
            "Container": "AccountType",
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "AuditLogs",
            "PartitionKeyPath": "/Path",
        },
        {
            "Container": "CoopOption",
            "PartitionKeyPath":"/AppId",
        },
        {
            "Container":"ScheduledTransactions",
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container": "LoanPayments",
            "PartitionKeyPath": "/AppId",
        },
        {
            "Container": "HookMessages",
            "PartitionKeyPath": "/MonthKey",
            "mapper": lambda e : { **e, "Status": "New", "TransactionId":None, "MonthKey":parse(e["Date"]).strftime("%Y-%m-01")}
        },
        {
            "Container": "LedgerEntries",
            "PartitionKeyPath": "/MonthGroup"
        },
        {
            "Container": "LedgerAccounts",
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "LoanProfiles",
            "PartitionKeyPath": "/AppId"
        },
        {
            "Container": "Loans",
            "PartitionKeyPath":"/AppId",
        },
        {
            "Container": "MemberProfiles",
            "PartitionKeyPath":"/AppId"
        },
        {
            "Container": "Payments",
            "PartitionKeyPath":"/AppId"
        },
        {
            "Container":"Transaction",
            "PartitionKeyPath":"/PartitionKey",
            "mapper": lambda e : { **e, "MonthKey": parse(e.Date).strftime("%Y-%m-01"), "Notifications" :[]}
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
     
      
 
     