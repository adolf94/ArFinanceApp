import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import { queryClient } from "../App"
import replaceById from "../components/replaceById"
import { Contribution, MemberProfile } from "../@types/FinanceApi/memberProfile"
import {LedgerAccount, LedgerEntry, NewContributionDto} from "FinanceApi";
import {COOP_OPTION} from "./coopOption";
import {LEDGER_ENTRY, updateLedgerCache} from "./ledgerEntries";
import {LEDGER_ACCT} from "./ledgerAcct";
export const MEMBER_PROFILE = "memberProfile"

export interface NewContribution extends NewContributionDto {
    userId : string,
    year?: number
}

export const getMemberProfiles = (year : number)=>{
    return api(`/memberProfiles/${year}`)
        .then(e=>e.data)
}

export const getMemberProfile = (userId: string,year : number)=>{
    return api(`users/${userId}/memberProfiles/${year}`)
        .then(e=>e.data)
}




export const useMutateMemberProfile = (year: number)=>{


    const create = useMutation({
        mutationFn : ( data : any)=>{
            return api.put(`/users/${data.userId}/memberProfiles/${data.year}` , data)
                .then(e=>e.data)
        },
        onSuccess : (data : any)=>{
            queryClient.invalidateQueries({queryKey:[MEMBER_PROFILE, {year:data.year}]})
            return data
        }
        

    })
    
    const addContribution  = useMutation({
        mutationFn : ( data : NewContribution )=>{
            return api.post(`/users/${data.userId}/memberProfiles/${year}/contributions` , data)
                .then((e)=>e.data)
        },
        onSuccess:(data)=>{
            
            queryClient.setQueryData([MEMBER_PROFILE, {year}],(prev : MemberProfile[])=>{
                let state = [...prev]
               return replaceById(data.item,state,"userId")
            })

            updateLedgerCache(data)
            return data.item
            
        },

    })
    return {create, addContribution}
}       