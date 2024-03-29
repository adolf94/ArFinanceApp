import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import { Account, CreateTransactionDto, NewTransactionResponseDto, Transaction } from "FinanceApi"
import { queryClient } from "../App"
import moment from "moment"
import { VENDOR, fetchVendorById } from "./vendors"
import { ACCOUNT, fetchAccounts, fetchByAccountId } from "./accounts"
import { AxiosResponse } from "axios"
import replaceById from "../common/replaceById"

export const TRANSACTION = "transaction"

export const fetchTransactionsByMonth = (year: number, month: number) => {


  return api<Transaction[]>("transactions", { params: { year, month } })
    .then(e => {
      return Promise.all(e.data.map(async item => {

        item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
        item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
        item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })

        queryClient.setQueryData([TRANSACTION, { id: item.id }], item)
        return item
      })
      ).then(async records => {
        let nextPeriodMonth = moment({year,month:month -1,day:1}).add(1, 'month')
        let accounts = await queryClient.ensureQueryData<Account[]>({ queryKey: [ACCOUNT], queryFn: () => fetchAccounts() })
        let nextMonth = await queryClient.getQueryData( [TRANSACTION, { year: nextPeriodMonth.year(), month: nextPeriodMonth.month() + 1 }])

        accounts.forEach(account => {
          if (!nextMonth && account.periodStartDay != 1) return
          const from = moment({ year, month : month -1, day: account.periodStartDay })

          queryClient.setQueryData([TRANSACTION, { accountId: account.id, month, year }],
            records.filter(e => (e.creditId == account.id || e.debitId == account.id) && moment(e.date).isAfter(from) && moment(e.date).isBefore(nextPeriodMonth)))
        })

        return records

      })
    })
}


export const fetchByAcctMonth = (acctId : string, year: number, month: number) => {


  return api<Transaction[]>(`/accounts/${acctId}/transactions`, { params: { year, month } })
    .then(e => {
      return Promise.all(e.data.map(async item => {

        item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
        item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
        item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })

        queryClient.setQueryData([TRANSACTION, { id: item.id }], item)
        return item
      })
      )
    })
}


export const fetchTransactionById = (transId) => {
  return api<Transaction>("transactions/" + transId)
    .then(async e => {
      let item = e.data;

      item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
      item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
      item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })

      return item
    })
}

export const useMutateTransaction = () => {


  const create = useMutation({
    mutationFn: (data: Partial<Transaction>) => {
      return api.post<NewTransactionResponseDto>("transactions", data)
        .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
          let item = e.data.transaction

          item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
          

          queryClient.setQueryData([TRANSACTION, { id: item.id }], item)

          queryClient.setQueryData([ACCOUNT, { id: item.creditId }], item.credit);
          queryClient.setQueryData([ACCOUNT, { id: item.debitId }], item.debit);

          queryClient.setQueryData([ACCOUNT], (prev) => {
            if (!prev || !Array.isArray(prev)) return undefined;
            return replaceById(e.data.accounts, prev)
          })


          return item
        })
    },
    onSuccess: async (item: Transaction) => {


      const key = {
        year: moment(item.date).get("year"),
        month: moment(item.date).get("month") + 1
      }

      queryClient.ensureQueryData<Transaction[]>({ queryKey: [TRANSACTION, key], queryFn: () => fetchTransactionsByMonth(key.year, key.month) })
        .then(query => {
          if (!query.some(trans => item.id == trans.id)) {
             
           queryClient.setQueryData([TRANSACTION, key], (prev : Transaction[])=>[...prev, item])
          }
        })
      }
    })


  const update = useMutation({
    mutationFn: (data : Partial<Transaction>) => {
        return api.put<NewTransactionResponseDto>("transactions/" + data.id, data)
          .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
            let item = e.data.transaction

            item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
            item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
            item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })


            const oldItem = await queryClient.getQueryData<Transaction>([TRANSACTION, { id: item.id }])
            if (!!oldItem) {

              let key = {
                year: moment(item.date).get("year"),
                month: moment(item.date).get("month") + 1
              }

              queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
                if (!prev || !Array.isArray(prev)) return undefined;
                let index = prev.findIndex(e => e.id == oldItem.id)
                if (index > -1) prev.splice(index, 1)
                return prev;
              })
            }



            queryClient.setQueryData([TRANSACTION, { id: item.id }], item)
            e.data.accounts.forEach(account => {
              queryClient.setQueryData([ACCOUNT, { id: account.id }], account);
            })

            queryClient.setQueryData([ACCOUNT], (prev) => {
              if (!prev || !Array.isArray(prev)) return undefined;
              return replaceById(e.data.accounts, prev)
            })

            

            let key = {
              year: moment(item.date).get("year"),
              month: moment(item.date).get("month") + 1
            }

            queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
              if (!prev || !Array.isArray(prev)) return undefined;
              return replaceById(item, prev)
            })

            return item
          })
      },

    })


  return {create : create.mutateAsync, update : update.mutateAsync} 
}

