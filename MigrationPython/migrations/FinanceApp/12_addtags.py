from datetime import datetime, timedelta, timezone
import pytz
import json
import re
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from functools import reduce



def up_migration(db):

    for row in db["Transaction"]:
        row["Tags"] = []

    return db
    # return db


def reset_ledgers(db):

    print("get min and max dates")
    def reduceMinMax(p,c):
        currentDate = parse(c["Date"]).replace(tzinfo=None)
        if currentDate < p["min"]: p["min"] = currentDate
        if currentDate > p["max"]: p["max"] = currentDate
        return p    
    
    def date_to_MonthKey(d: datetime):
        tz = pytz.timezone("Asia/Manila")
        daaate = d.astimezone(tz).strftime("%Y-%m-01")
        return daaate
        

    def datestr_to_monthKey(string: str):
        tz = pytz.timezone("Asia/Manila")
        daaate = parse(string).astimezone(tz).strftime("%Y-%m-01")
        return daaate

    minMax = reduce( reduceMinMax, db["Transaction"], {"min":datetime(2025,2,1), "max":datetime(2000,1,1)} )
    minMax = {
        "min": datestr_to_monthKey((minMax["min"] + relativedelta(months=-1)).strftime("%Y-%m-01")),
        "max": datestr_to_monthKey(minMax["max"].strftime("%Y-%m-01")),
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
                "DateStart": date_to_MonthKey(month.replace(day=c["PeriodStartDay"])),
                "DateEnd": date_to_MonthKey(month.replace(day=c["PeriodStartDay"]) + relativedelta(months=1)),
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
            "id": f"{month.strftime("%Y-%m-01")}",
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
    
    AccountDictionary = reduce(lambda p,c: ({**p, c["id"]:c}), 
                               db["Account"],
                                {})

    BalanceDictionary = reduce(lambda p,c: {**p, c["id"]:c}, 
                               acctBals,
                               {})
    
    def updateAcct(acctId, amount):
        acctToUpdate = AccountDictionary[acctId]
        acctToUpdate["Balance"] += amount

    def updateMonthBal(transactionId, date, epoch): 
        monthKey = datestr_to_monthKey(date)
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
    

    tz = pytz.timezone("Asia/Manila")
    db["HookMessages"] = list(map(lambda e: {**e,"Status": "New", "$type":"HookMessage","MonthKey":datestr_to_monthKey(e["Date"])}, db["HookMessages"]))


    for tran in db["Transaction"]:
        tran["EpochUpdated"] = parse(tran["DateAdded"]).timestamp()
        tran["MonthKey"] = datestr_to_monthKey(tran["Date"])

        updateMonthBal(tran["id"], tran["Date"], tran["EpochUpdated"])

        updateAcct(tran["DebitId"], tran["Amount"])
        debitKey = updateBalances(tran["id"], tran["DebitId"], tran["Date"], tran["EpochUpdated"]
                                  , tran["Amount"])

        updateAcct(tran["CreditId"], -tran["Amount"])
        creditKey = updateBalances(tran["id"], tran["CreditId"], tran["Date"], tran["EpochUpdated"]
                                  , -tran["Amount"])
        
        tran["Reference"] = "" if ("Reference" not in tran or tran["Reference"] is None) else tran["Reference"]

        for i,notif in enumerate(tran["Notifications"]):
            if not re.search(r"^([0-9]{4}-[0-9]{2}-[0-9]{2}\|)", notif):
                n = next((item for item in db["HookMessages"] if item["id"] == notif), None)
                if n is not None:
                    new_key = n["MonthKey"] + "|" + notif
                    tran["Notifications"][i] = new_key
                    print(f"{n["MonthKey"]} => {new_key}")
                else: 
                    tran["Notifications"] = [item for item in tran["Notifications"] if item != notif ]
                    print(f"{notif} not found.")

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

    grouped_balace = {}
    final_acctBals = []
    for b in acctBals:
        if b["AccountId"] not in grouped_balace:
            grouped_balace[b["AccountId"]] = []
        
        grouped_balace[b["AccountId"]] = grouped_balace[b["AccountId"]] + [b]
    
    for acctId in grouped_balace:
        grouped_balace[acctId].sort(key = lambda d: d["id"])
        keep_index = 0
        for i, value in enumerate(grouped_balace[acctId]):
            if value["EndingBalance"] != 0:
                keep_index = i - 1
                break
        if keep_index == -1:
            keep_index = 0
        #if keep_index = -1 as is lang

        
        copied_grouped = sorted(grouped_balace[acctId], key = lambda d: d["id"], reverse=True)
        last_index = len(copied_grouped)
        for i, value in enumerate(copied_grouped):
            if value["EndingBalance"] != value["Balance"]:
                last_index = len(copied_grouped) - i 
                break

        AccountDictionary[acctId]["MinMonth"] = datestr_to_monthKey(grouped_balace[acctId][keep_index]["DateStart"])
        AccountDictionary[acctId]["MaxMonth"] = datestr_to_monthKey(grouped_balace[acctId][last_index-1]["DateStart"])

        final_acctBals = final_acctBals + grouped_balace[acctId][keep_index:last_index]
        

    db["AccountBalance"] = final_acctBals
    


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
            "ResetOnMigration": False,
            "mapper": lambda e : ({**e})
        },
        {
            "Container": "AccountBalance",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "AccountGroup",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/PartitionKey",
            "mapper": lambda e : {**e }
        },
        {
            "Container": "AccountType",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "AuditLogs",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/Path",
        },
        {
            "Container": "CoopOption",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/AppId",
        },
        {
            "Container": "Files",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/PartitionKey",
        },
        {
            "Container":"HookConfigs",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/Type"
        },
        {
            "Container": "HookMessages",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/MonthKey",
            "mapper": lambda e : { **e, "Status": "New", "MonthKey":parse(e["Date"]).strftime("%Y-%m-01")}
        },
        {
            "Container":"HookReferences",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container": "LedgerEntries",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/MonthGroup"
        },
        {
            "Container": "LedgerAccounts",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "LoanProfiles",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/AppId"
        },
        {
            "Container": "LoanPayments",
            "ResetOnMigration": False,
            "PartitionKeyPath": "/AppId",
        },
        {
            "Container":"LoginLogs",
            "ResetOnMigration":True,
            "PartitionKeyPath": "/PartitionKey"
        },
        {
            "Container": "Loans",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/AppId",
        },
        {
            "Container": "MemberProfiles",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/AppId"
        },
        {
            "Container":"MonthTransactions",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container": "Payments",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/AppId"
        },
        {
            "Container":"ScheduledTransactions",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container":"Transaction",
            "PartitionKeyPath":"/PartitionKey",
            "mapper": lambda e : { **e, "MonthKey": parse(e.Date).strftime("%Y-%m-01")}
        },
        {
            "Container":"Tags",
            "ResetOnMigration": True,
            "PartitionKeyPath":"/PartitionKey",
        },
        {
            "Container":"User",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container":"UserCredentials",
            "ResetOnMigration": True,
            "PartitionKeyPath":"/PartitionKey"
        },
        {
            "Container":"Vendor",
            "ResetOnMigration": False,
            "PartitionKeyPath":"/PartitionKey"
        }
    ]
     
      
 
     