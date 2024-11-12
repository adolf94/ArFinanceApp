import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import {queryClient} from "../App";
import {LOAN} from "./loan";



export const useMutatePayment = ()=>{


    const create = useMutation({
        mutationFn: (item : any )=>{
            return api.post("/payment", item)
                .then(res=>res.data)
        },
        onSuccess: (data)=>{
            queryClient.invalidateQueries({ queryKey: [LOAN,{userId: data.userId}] })
        }
    })

    return {create}
}

