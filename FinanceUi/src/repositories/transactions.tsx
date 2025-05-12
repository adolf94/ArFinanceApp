import { useMutation } from "@tanstack/react-query";
import api from "../components/api";
import {
    Account, 
    CreateTransactionDto,
    NewTransactionResponseDto,
    Transaction,
    Vendor,
} from "FinanceApi";
import { queryClient } from "../App";
import moment from "moment";
import { VENDOR, fetchVendorById } from "./vendors";
import { ACCOUNT, fetchAccounts, fetchByAccountId } from "./accounts";
import { AxiosResponse } from "axios";
import replaceById from "../common/replaceById";
import {closeSnackbar, enqueueSnackbar } from "notistack";
import db, { AccountBalance, MonthlyTransaction } from '../components/LocalDb/AppDb'
import {ACCOUNT_BALANCE, getBalancesByDate} from "./accountBalance.js";
import numeral from "numeral";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import { HOOK_MESSAGES } from "./hookMessages";


export const TRANSACTION = "transaction";


export const MONTHLY_TRANSACTION = "monthly_transaction";


export const temporaryAddTransaction = async (item) => {

    const key = {
        year: moment(item.date).get("year"),
        month: moment(item.date).get("month") + 1,
    };
    let mData = queryClient.getQueryData<Transaction[]>([TRANSACTION, key])
    
    //get prevItem if it was previously Fetched 
    let prevItem = queryClient.getQueryData<Transaction>([TRANSACTION, { id: item.id }])
    item = await ensureTransactionAcctData(item)
    if (prevItem && moment(prevItem.date).format("YYYY-MM") !== moment(item.date).format("YYYY-MM")) {

        let prevKey = {
            year: moment(item.date).get("year"),
            month: moment(item.date).get("month") + 1,
        };
        queryClient.setQueryData([TRANSACTION, prevKey], (prev: Transaction[]) => {
            return prev.filter(e => e.id === item.id)
        });
    }

    if (mData) {

        queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
            console.debug(`transaction ${item.id} added to ${key.year}-${key.month}`)
            return replaceById(item, mData);
        });
    }

    const doRollback = () => {
        //if it did not exist
        //if it was not previously fetch, no need to remove. wala eh
        if (!prevItem) {
            queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
                return prev.filter(e=>e.id===item.id)
            });
        }else{
            //if exist before;

            //if prevItem was in a different month
            
            if (moment(prevItem.date).format("YYYY-MM") !== moment(item.date).format("YYYY-MM")) {
                queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
                    return prev.filter(e => e.id === item.id)
                });
            } 

            let prevKey = {
                year: moment(item.date).get("year"),
                month: moment(item.date).get("month") + 1,
            };
            queryClient.setQueryData([TRANSACTION, prevKey], (prev: Transaction[]) => {
                return replaceById(prevItem, prev);
            });

        }
    }

    return {prevItem, didExist:!!prevItem, doRollback};
    
}

export const addToTransactions = (item: Transaction, replace: boolean) => {
    const { debit, credit } = item;



    queryClient.setQueryData([TRANSACTION, {id: item.id}], item);



  const key = {
    year: moment(item.date).get("year"),
    month: moment(item.date).get("month") + 1,
  };


    let mData = queryClient.getQueryData<Transaction[]>([TRANSACTION, key])
    if (mData) {

        queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
            console.debug(`transaction ${item.id} added to ${key.year}-${key.month}`)
            return replaceById(item, mData);
        });
    }



  let dKey = {
    accountId: debit.id,
    year: moment(item.date).add(-debit.periodStartDay + 1, "day").year(),
    month: moment(item.date).add(-debit.periodStartDay + 1, "day").month() + 1,
  };


    let dData = queryClient.getQueryData<Transaction[]>([TRANSACTION, dKey])
    if (dData) {

        queryClient.setQueryData([TRANSACTION, dKey], (prev: Transaction[]) => {
            console.debug(`transaction ${item.id} added to ${dKey.accountId}-${dKey.year}-${dKey.month}`)
            return replaceById(item, dData);
        });
    }

  let cKey = {
    accountId: credit.id,
    year: moment(item.date).add(-credit.periodStartDay + 1, "day").year(),
    month: moment(item.date).add(-credit.periodStartDay + 1, "day").month() + 1,
    };

    let cData = queryClient.getQueryData<Transaction[]>([TRANSACTION, cKey])
    if (cData) {

        queryClient.setQueryData([TRANSACTION, cKey], (prev: Transaction[]) => {
            console.debug(`transaction ${item.id} added to ${cKey.accountId}-${cKey.year}-${cKey.month}`)
            return replaceById(item, cData);
        });
    }

    


};

export const fetchTransactionsByMonthKey = async (year: number, month: number, offline: boolean) => {
  console.debug("fetchTransactionsByMonthKey",  { year, month });
  let key = moment([year, month,1]).format("YYYY-MM-01")

  let monthData = await db.monthTransactions.where("monthKey").equals( key ).first();
  let hasData = !!monthData

    if (offline && !hasData) return Promise.reject({message: 'no data available'})
  if(offline && hasData) {
    return Promise.all( monthData.transactions.map((tr)=>{
      return db.transactions.where("id").equals(tr.id).first()
    }))
  }

  const revalidateData = (origData : Transaction[], item : MonthlyTransaction) : Promise<Transaction[]> => {
    return Promise.all(item.transactions.map(d=>{
        let data = origData.find(e=>e.id === d.id)
        if(data && data.epochUpdated === d.epochUpdated) return data

        return api(`transactions/${d.id}`)
          .then(res=>res.data)
    }))

  }
  
  let monthlytransaction = await queryClient.ensureQueryData({
    queryKey: [MONTHLY_TRANSACTION, {monthKey: key}],
    queryFn: ()=>api.get(`monthlytransaction/${key}`).then((e:MonthlyTransaction)=>e.data)
  }) 
  let transactions = [] as Transaction[]
  if(!hasData){
     transactions = await api<Transaction[]>("transactions", { params: { year, month : month + 1 }, noLastTrans: false })
        .then(res=>res.data) as Transaction[]
  }else{
    transactions = await Promise.all(monthlytransaction.transactions.map(
      (item)=>db.transactions.where("id").equals(item.id).first()
    )).then(items=>items.filter(e=>!!e))
  }



  let revalidatedData = await revalidateData(transactions , monthlytransaction)
  db.monthTransactions.put(monthlytransaction)
  
  let output = await Promise.all(revalidatedData.map(e=>ensureTransactionAcctData(e)))
      
  return output;



}

export const fetchByAccountMonthKey = async (
  acctId: string,
  year: number,
  month: number,
  offline: boolean = false
)=>{
    console.debug("fetchTransactionsByMonthKey",  { year, month });
    let date = moment([year, month - 1,1])
  
    let accountBalance = await db.accountBalances.where("id").equals( `${date.format("YYYY|MM")}|${acctId}` ).first();
    let hasData = !!accountBalance
  
    if(offline && !hasData) return []
    if(offline && hasData) {
      return Promise.all( accountBalance.transactions.map((tr)=>{
        return db.transactions.where("id").equals(tr.transactionId).first()
      })).then(items=>items.filter(e=>!!e))
    }


    const revalidateData = (origData : Transaction[], item : AccountBalance) : Promise<Transaction[]> => {
      return Promise.all(item.transactions.map(d=>{
          let data = origData.find(e=>e.id === d.transactionId)
          if(data && data.epochUpdated === d.epochUpdated) return data
  
          return api(`transactions/${d.transactionId}`)
            .then(res=>res.data)
      }))
  
    }
    accountBalance = await queryClient.ensureQueryData({
      queryKey: [ACCOUNT_BALANCE,{accountId: acctId, date: moment([year,month,1]).format("yyyy-MM-01")}], 
      queryFn: ()=>getBalancesByDate(moment([year,month,1]).format("yyyy-MM-01"), acctId)
    })
    let transactions = [] as Transaction[]
    
    if(!hasData){
        let KEY1 = date.format("YYYY-MM-01")
        let MT1 = await db.monthTransactions.where("monthKey").equals( KEY1 ).first();
        
        if(!MT1){
           await api<Transaction[]>("transactions", { params: { year, month  }, noLastTrans: false })
            .then(res=>res.data as Transaction[])
            .then(items=>Promise.all(items.map(e=>ensureTransactionAcctData(e)))) 



            await queryClient.ensureQueryData({
              queryKey: [MONTHLY_TRANSACTION, {monthKey: KEY1}],
              queryFn: ()=>api.get(`monthlytransaction/${KEY1}`).then(e=>e.data)
            }) 
            .then((m)=>db.monthTransactions.put(m))
        }
        let date0 = date.clone().add(-1,'month')
        let key0 = date0.format("YYYY-MM-01")
        let mt0 = await db.monthTransactions.where("monthKey").equals( key0 ).first();

        if(!mt0){
          let data = await api<Transaction[]>("transactions", { params: { year: date0.year(), month: date0.month() + 1  }, noLastTrans: false })
            .then(res=>res.data as Transaction[])
            .then(items=>Promise.all(items.map(e=>ensureTransactionAcctData(e)))) 
            

            
            await queryClient.ensureQueryData({
              queryKey: [MONTHLY_TRANSACTION, {monthKey: key0}],
              queryFn: ()=>api.get(`monthlytransaction/${key0}`).then(e=>e.data)
            }) 
            .then((m)=>db.monthTransactions.put(m))
        }
    }
 
      transactions = await Promise.all(accountBalance.transactions.map(
        (item)=>db.transactions.where("id").equals(item.transactionId).first()
      )).then(items=>items.filter(e=>!!e))

    let revalidatedData = await revalidateData(transactions , accountBalance)
    db.accountBalances.put(accountBalance)
    
    let output = await Promise.all(revalidatedData.map(e=>ensureTransactionAcctData(e)))
        
    return output;
  
}






export const fetchTransactionsByMonth = (year: number, month: number, persistLast? : string ) => {
 

    return api<Transaction[]>("transactions", { params: { year, month }, noLastTrans: persistLast }).then(
      (e : AxiosResponse<Transaction[]>) => {

        const lastTransId = localStorage.getItem("last_transaction");

      return Promise.all(
        e.data.map(async (item) => {
            item = await ensureTransactionAcctData(item)
            if (!lastTransId && e.headers['X-Last-Trans'] === item.id) localStorage.setItem('last_transaction', item.id)
          queryClient.setQueryData([TRANSACTION, { id: item.id }], item);
          return item;
        }),
      ).then(async (records) => {
        // let nextPeriodMonth = moment({ year, month: month, day: 1 }).add(
        //   1,
        //   "month",
        // );
        // let accounts = await queryClient.ensureQueryData<Account[]>({
        //   queryKey: [ACCOUNT],
        //   queryFn: () => fetchAccounts(),
        // });
        // let nextMonth = await queryClient.getQueryData([
        //   TRANSACTION,
        //   { year: nextPeriodMonth.year(), month: nextPeriodMonth.month() + 1 },
        // ]);

        // accounts.forEach((account) => {
        //   if (!nextMonth || account.periodStartDay !== 1) return;
        //   const from = moment({
        //     year,
        //     month: month,
        //     day: account.periodStartDay,
        //   });
        //
        //   queryClient.setQueryData(
        //     [TRANSACTION, { accountId: account.id, month, year }],
        //     records.filter(
        //       (e) =>
        //         (e.creditId === account.id || e.debitId === account.id) &&
        //         moment(e.date).isAfter(from) &&
        //         moment(e.date).isBefore(nextPeriodMonth),
        //     ),
        //   );
        // });

        return records;
      });
    },
  );
};

export const fetchByAcctMonth = async (
  acctId: string,
  year: number,
  month: number,
) => {
    let monthStr =  moment([year,month - 1,1]).format('yyyy-MM-01')
    let acct = await queryClient
        .ensureQueryData<Account>({
            queryKey: [ACCOUNT, { id: acctId }],
            queryFn: () => fetchByAccountId(acctId),
            networkMode: "always",
        })
    
    let currentMonthTransactions = await queryClient.ensureQueryData({
        queryKey: [TRANSACTION, { year, month }],
        queryFn: () => fetchTransactionsByMonth(year, month),
    })

    let balanceData = await queryClient.ensureQueryData<AccountBalance>({
        queryKey:[
            ACCOUNT_BALANCE,
            { accountId: acctId, date:monthStr},
        ],
        queryFn: ()=>getBalancesByDate( monthStr, acctId)
    })
    
    if(acct.periodStartDay != 1){
        let nextMonth =moment([year,month - 1 ,1]).add(1,"month");
        let nextMonthTransactions = await queryClient.ensureQueryData({
            queryKey: [TRANSACTION, { year: nextMonth.year(), month : nextMonth.month() + 1 }],
            queryFn: () => fetchTransactionsByMonth(nextMonth.year(),  nextMonth.month() + 1 ),
        })
    }
    
    return  await Promise.all(balanceData.transactions.map(e=>{
        return queryClient.ensureQueryData({
            queryKey:[TRANSACTION,{id:e.transactionId}],
            queryFn: ()=>fetchTransactionById(e.transactionId)
        }) 
    }))
    

};


export const fetchTransactionById = (transId: string) => {
  return api<Transaction>("transactions/" + transId).then(async (e) => {
    let item = e.data;

      return ensureTransactionAcctData(item);
  });
};


export const ensureTransactionAcctData = async (item) => {



    item.vendor =
        item.vendorId ?
            (await queryClient.ensureQueryData<Vendor>({
                queryKey: [VENDOR, { id: item!.vendorId }],
                queryFn: () => fetchVendorById(item!.vendorId!),
            })) : null;


    item.credit = await queryClient.ensureQueryData({
        queryKey: [ACCOUNT, { id: item.creditId }],
        queryFn: () => fetchByAccountId(item.creditId)
    })
    item.debit = await queryClient.ensureQueryData({
        queryKey: [ACCOUNT, { id: item.debitId }],
        queryFn: () => fetchByAccountId(item.debitId)
    })
    
    db.transactions.put(item)
    
    item.notifications.forEach((hookId)=>{
        db.hookMessages.where("id").equals(hookId).first()
        .then(toUpdate=>{
          if(!!toUpdate){
            toUpdate.transactionId = item.transactionId
            db.hookMessages.put(toUpdate)
            queryClient.setQueryData([HOOK_MESSAGES, { id: toUpdate.id }], toUpdate)
          }
        })
    })
    

    return item;

}


export const useMutateTransaction = () => {
  const [snackbarId, setSnackbarId] = useState<string>("");  
    
    
  const create = useMutation({
      mutationFn: (data: Partial<Transaction>) => {
        
          let id = enqueueSnackbar(<><CircularProgress /> Saving... </>, {persist:true, variant:'info'})
          // setSnackbarId(id)
          return api
              .post<NewTransactionResponseDto>("transactions", data, { noLastTrans:true})
            .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
              let item  = e.data.transaction;

              localStorage.setItem("last_transaction", item.id)

                let accounts = e.data.accounts;
                accounts.forEach(e => {
                    queryClient.setQueryData([ACCOUNT, { id: e.id }], e);
                    db.accounts.put(e)
                })


                e.data.balances.forEach(e =>{
                    let item = db.accountBalances.where("id").equals(e.id)
                        .first()
                        //dont insert if not existing,
                      queryClient.setQueryData([MONTHLY_TRANSACTION, {monthKey: e.monthKey}], e)

                    if(!!item) {
                      queryClient.setQueryData([
                            ACCOUNT_BALANCE,
                            { accountId: e.accountId, date: moment(e.dateStart).format("YYYY-MM-dd") }]
                            , e)
                      db.accountBalances.put(e)
                    }
                })
                e.data.monthly.forEach(e => {
                    let item = db.accountBalances.where("id").equals(e.monthKey)
                        .first()
                    //dont insert if not existing,
                    if (!!item) {
                      queryClient.setQueryData([MONTHLY_TRANSACTION, {monthKey: e.monthKey}], e)
                      db.monthTransactions.put(e)
                    }
                })

                item = await ensureTransactionAcctData(item);
              queryClient.setQueryData([TRANSACTION, { id: item.id }], item);


              queryClient.setQueryData([ACCOUNT], (prev) => {
                if (!prev || !Array.isArray(prev)) return undefined;
                return replaceById(e.data.accounts, prev);
              });
                closeSnackbar(id);
                return item;

            }).catch((ex=>{
              
              closeSnackbar(id);
              return Promise.reject(ex)
            }));

      },
      onMutate: (item) => {
          let ctx = temporaryAddTransaction(item);
          return ctx;
      },
        onSuccess: async (item: Transaction, vars, ctx) => {
         enqueueSnackbar("Saved!", {variant : 'info'})  
          addToTransactions(item, true);
      },
      onError: (err, newTodo, context) => {
         context.doRollback()
       },
  });

  const update = useMutation({
    mutationFn: (data: Partial<Transaction>) => {
          return api
        .put<NewTransactionResponseDto>("transactions/" + data.id, data)
        .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
          let item = e.data.transaction;
            item = await ensureTransactionAcctData(item);

          const oldItem = await queryClient.getQueryData<Transaction>([
            TRANSACTION,
            { id: item.id },
          ]);
          if (!!oldItem) {
            let key = {
              year: moment(item.date).get("year"),
              month: moment(item.date).get("month") + 1,
            };

            queryClient.setQueryData(
              [TRANSACTION, key],
              (prev: Transaction[]) => {
                if (!prev || !Array.isArray(prev)) return undefined;
                let index = prev.findIndex((e) => e.id == oldItem.id);
                if (index > -1) prev.splice(index, 1);
                return prev;
              },
            );
          }

          queryClient.setQueryData([TRANSACTION, { id: item.id }], item);
          e.data.accounts.forEach((account) => {
            queryClient.setQueryData([ACCOUNT, { id: account.id }], account);
          });

          queryClient.setQueryData([ACCOUNT], (prev) => {
            if (!prev || !Array.isArray(prev)) return undefined;
            return replaceById(e.data.accounts, prev);
          });


          e.data.balances.forEach(e =>{
            let item = db.accountBalances.where("id").equals(e.id)
                .first()
                //dont insert if not existing,
              queryClient.setQueryData([MONTHLY_TRANSACTION, {monthKey: e.monthKey}], e)

              if(!!item) {
                queryClient.setQueryData([
                      ACCOUNT_BALANCE,
                      { accountId: e.accountId, date: moment(e.dateStart).format("YYYY-MM-dd") }]
                      , e)
                db.accountBalances.put(e)
              }
          })
          e.data.monthly.forEach(e => {
              let item = db.accountBalances.where("monthKey").equals(e.monthKey)
                  .first()
              //dont insert if not existing,
              if (!!item) {
                queryClient.setQueryData([MONTHLY_TRANSACTION, {monthKey: e.monthKey}], e)
                db.monthTransactions.put(e)
              }
          })

          return item;
        })
      },
      onMutate: (item) => {
          let ctx = temporaryAddTransaction(item);
          return ctx;
      },
      onSuccess: async (item: Transaction, vars, ctx) => {
          enqueueSnackbar("Saved!", { variant: 'info' })
          addToTransactions(item, true);
          item.notifications.forEach((id)=>{

          })
      },
      onError: (err, newTodo, context) => {
          context.doRollback()
      },
  });

  return { create: create.mutateAsync, createExt : create, update: update.mutateAsync, updateExt:update };
};


export const getAfterTransaction = (id : string ) => {
    return api.get("transactions", {
        params: {
            after:id
        }
    }).then( async resp => {

        let transactions = await Promise.all(
            resp.data.map(async item => await ensureTransactionAcctData(item))
        )
        transactions.forEach(item => addToTransactions(item, false))

        let acctsToRefetch = resp.data.reduce((prev, item, i) => {
            if(!prev.includes(item.creditId)) prev.push(item.creditId)
            if (!prev.includes(item.debitId)) prev.push(item.debitId)
            return prev
        }, [])
        acctsToRefetch.forEach(e => {
            queryClient.prefetchQuery({ queryKey: [ACCOUNT, { id: e }], staleTime: 100, queryFn: () => fetchByAccountId(e) })
        })

        console.debug("added new transactions");
        let lastId = resp.headers["x-last-trans"]
        if (lastId) localStorage.setItem("last_transaction", lastId)
        

        return resp.data
    })
}
