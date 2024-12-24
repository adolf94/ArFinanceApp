import { CreateLoanDto } from "FinanceApi"
import api from "../components/api"
import { useMutation } from "@tanstack/react-query"
import {queryClient} from "../App";
import {updateLedgerCache} from "./ledgerEntries";


export const LOAN   = "loan"

export const getByUserId = (userId: string)=>{

    return api.get(`/user/${userId}/loan`)
        .then(res=>res.data)
}

export const getByMemberId = (userId: string)=>{

    return api.get(`/member/${userId}/loan`)
        .then(res=>res.data)
}
 
export const getByLoanId = (loanId: string)=>{

    return api.get(`/loan/${loanId}`)
        .then(res=>res.data)
}

export const useMutateLoan = ()=>{
    const create = useMutation({
        mutationFn : (data: CreateLoanDto) => {
            return api.post("loan", data)
                .then(e=>e.data)
        },
        onSuccess: (data)=>{
            queryClient.invalidateQueries({ queryKey: [LOAN,{userId: data.item.userId}] })
            updateLedgerCache(data)
        }
    })

    return {create}
}