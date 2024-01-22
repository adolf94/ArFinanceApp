import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import { Transaction } from "FinanceApi"
import { queryClient } from "../App"
import moment from "moment"
import { VENDOR, fetchVendorById } from "./vendors"
import { ACCOUNT, fetchByAccountId } from "./accounts"

export const TRANSACTION = "transaction"

export const fetchByMonth = (year :number, month : number ) => {


  return api<Transaction[]>("transactions", { params: { year, month } })
    .then(e => {
      return Promise.all(e.data.map(async item => {

            item.vendor = await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
            item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
            item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })

            queryClient.setQueryData([TRANSACTION, {id: item.id}], item)
            return item
          })
        )
    })
}


export const useMutateTransaction = () => {


  const create = useMutation({
    mutationFn: (data: Partial<Transaction>) => {
      return api.post("transactions", data)
        .then(e => e.data)
    },
    onSuccess: async (item: Transaction) => {

      item.vendor = await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
      item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
      item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })


      queryClient.setQueryData([TRANSACTION, { id: item.id }], item)
      const key = {
        year: moment(item.date).get("year"),
        month : moment(item.date).get("month") + 1
      }



      queryClient.ensureQueryData<Transaction[]>({ queryKey: [TRANSACTION, key], queryFn: () => fetchByMonth(key.year, key.month) })
        .then(query => {
          if (!query.some(trans => item.id == trans.id)) {
             
           queryClient.setQueryData([TRANSACTION, key], (prev : Transaction[])=>[...prev, item])
          }
        })
      }
    })



  return {create : create.mutateAsync} 
}

