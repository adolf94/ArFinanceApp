import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"


export const TRANSACTION_GROUP = "transactiongroup"

export const getOneTransactionGroup = (id)=>{

    return api.get(`/transactiongroups/${id}`)
        .then(e=>{
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

    return {create}
}