import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"
import { TransactionGroup } from "FinanceApi"
import { fetchByAccountId } from "./accounts"
import { fetchVendorById } from "./vendors"


export const TRANSACTION_GROUP = "transactiongroup"

export const getOneTransactionGroup = (id)=>{

    return api.get<TransactionGroup>(`/transactiongroups/${id}`)
        .then(async e=>{
            let item = e.data

            item.account = await fetchByAccountId(item.accountId)
            item.vendor = await fetchVendorById(item.vendorId)

            item.items = item.items.map(e=>{
            })

            return e.data
        })
}


export const useMutateTransactionGroup = ()=>{

    const create = useMutation({
        mutationFn : (newItem)=>{
            
            return api.post("transactiongroups", newItem)
                .then(e=>e.data)
        }
    })

    const update = useMutation({
        mutationFn : (newItem : any)=>{
            
            return api.post(`transactiongroups/${newItem.id}`, newItem)
                .then(e=>e.data)
        }
    })

    return {create, update}
}