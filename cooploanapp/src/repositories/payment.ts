import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import {queryClient} from "../App";
import {LOAN} from "./loan";
import { LoanPayment } from "FinanceApi";
import {LoanPayment} from "FinanceApi";



export const useMutatePayment = ()=>{


    const create = useMutation({
        mutationFn: async (item : any )=>{
            return api.post<LoanPayment>("/payment", item)
                .then(res=>res.data)
        },
        onSuccess: (data)=>{
            queryClient.invalidateQueries({ queryKey: [LOAN,{userId: data.userId}] })
        }
    })

    return {create}
}

