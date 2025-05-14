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
		mapper: e=> ({...e,Transactions:[]}),
		"PartitionKeyPath": "/PartitionKey"
	  },
	  {
		"Container": "AccountGroup",
		"PartitionKeyPath": "/PartitionKey"
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
		mapper: e=>e
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
		mapper: e=> ({...e, id: `Transaction|${e.Id}`})
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
	  }
	]
  },
  dataMigration:(db)=>{
	
	console.log("get min and max dates");
	//clear balance table
	let minMax = db.Transaction.reduce((p,c,i)=>{
	  if(moment(c.Date).isBefore(p.min)) p.min = c.Date
	  if(moment(c.Date).isAfter(p.max)) p.max = c.Date
	  return p
	}, {min: "2025-02-01", max:"2000-01-01"})
	
	minMax = {
	  min : moment(minMax.min).add("M", -1).date(1).format("YYYY-MM-DD"),
	  max : moment(minMax.max).date(1).format("YYYY-MM-DD")
	}

	console.log("set min and max dates");
	db.Account = db.Account.map(acct=>{
	  acct.MinMonth = minMax.min
	  acct.MaxMonth = minMax.max
	  acct.Balance = 0
	  acct.CurrBalance = 0
	  return acct
	})




	console.log("generate balances");
	
	  let acctBals = db.Account.reduce((p, c, i) => {
		  let month = moment(c.MinMonth)
		  while (month.isSameOrBefore(c.MaxMonth)) {
			  let currentKey = `${month.format("YYYY|MM")}|${c.Id}`;
			  let item = {
				  AccountId: c.Id,
				  id: `AccountBalance|${currentKey}`,
				  Id: currentKey,
				  Discriminator: "AccountBalance",
				  Year: month.year(),
				  Month: month.month() + 1,
				  DateStart: month.clone().date(c.PeriodStartDay).format("YYYY-MM-DD"),
				  DateEnd: month.clone().date(c.PeriodStartDay).add("M", 1).format("YYYY-MM-DD"),
				  Balance: 0,
				  EndingBalance: 0,
				  PartitionKey: "default",
				  Transactions: []
			  }
			  p.push(item)

			  month.add(1, "month");
		  }
		  return p;
	  }, [])



	  let balances = () => {
		  let p = []
		  let month = moment(minMax.min)
		  while (month.isSameOrBefore(minMax.max)) {
				console.log(month.toISOString())
			  let newitem = {
					id: `MonthlyTransaction|${month.format("YYYY-MM-01")}`,
				  MonthKey: month.format("YYYY-MM-01"),
				  PartitionKey: "default",
				  Discriminator: "MonthlyTransaction",
				  Transactions:[]
			  }
			  p.push(newitem)
			  month.add(1,"month")
		  }
		  return p
	  }
	  console.log("generting month balances");
	  db.MonthTransactions = balances()

	  let monthKeys = db.MonthTransactions.reduce((p, c, i) => {

		  p[c.MonthKey] = c;
		  return p;
	  }, {})
	console.log("create account dictionary");
	
	let AccountDictionary =db.Account.reduce((p,c,i)=>{
	  	p[c.Id] = c;
		return p;
	  },{})
	console.log("create account dictionary");
	
	let BalanceDictionary = acctBals.reduce((p,c,i)=>{
	  p[c.Id] = c;
	  return p;
	},{})


	const updateAcct = (acctId, amount)=>{
	  
	  let accountToUpdate = AccountDictionary[acctId];
	  accountToUpdate.Balance += amount
	  
	}
	
	const updateMonthBal = (transactionId,date,epoch)=>{

		let monthKey = moment(date).date(1).format("YYYY-MM-01");
		

		monthbal = monthKeys[monthKey]
		monthbal.Transactions.push({
			Id: transactionId,
			EpochUpdated:epoch 
		})
		console.log(`${transactionId} - ${epoch}`)
	}

	const updateBalances = (transactionId, acctId,date,epoch, amount)=>{
	  let acct = AccountDictionary[acctId];
	  const isPrevPeriod = moment(date).date() < acct.PeriodStartDay
	  const period = moment(date).add('months', isPrevPeriod?-1:0)
	  
		let key = `${period.format("YYYY|MM")}|${acctId}`;

		try {
			let curBalance = BalanceDictionary[key];
			curBalance.EndingBalance += amount
			curBalance.Transactions = [...curBalance.Transactions, {
				TransactionId: transactionId, 
				Amount: amount,
				EpochUpdated: epoch
			}];


		}catch(ex){
			console.log(`missing iun dictionary : ${key}`)
			throw ex
		}
	  //update balances
	  acctBals.filter(e=> e.AccountId === acctId && e.Id > key)
		.forEach(b=>{
		  b.Balance += amount;
		  b.EndingBalance += amount;
		});
	  
	  return key;
	  
	  
	}
	
	db.HookMessages = db.HookMessages.map(e => ({ ...e, MonthKey:moment("YYYY-MM-01")}))
	console.log("update acct and balance data");
	db.AccountBalance = acctBals
	db.Transaction.forEach((tran, i)=> {
	const { DebitId, CreditId, Amount, Id, Date : date, DateAdded } = tran
		//debit

		tran.EpochUpdated = moment.utc(DateAdded).unix()
		tran.MonthKey = moment(date).format("YYYY-MM-01")

		updateMonthBal(Id, date, tran.EpochUpdated)
	  updateAcct(DebitId, Amount)
	  
		let debitKey = updateBalances(Id, DebitId, date, tran.EpochUpdated, Amount)


	  //credit
	  updateAcct(CreditId, -Amount)
		let creditKey = updateBalances(Id, CreditId, date, tran.EpochUpdated, -Amount)


	  tran.BalanceRefs = [
		  {
			AccountId: DebitId,
			AccountBalanceKey: debitKey,
			IsDebit: true
		  },
		  {
			AccountId: CreditId,
			AccountBalanceKey: creditKey,
			IsDebit: false
		  }
		]

	})
	
	
	
	
	
	
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
