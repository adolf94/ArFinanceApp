import { useMutation } from "@tanstack/react-query"
import { queryClient } from "../App"
import api from "../components/api"


export const COOP_OPTION = "coopOption"



export const getOptionByYear = (year : number)=>{
    return api(`/coopoptions/${year}`)    
        .then(e=>e.data)
}


export const useMutateCoopOption = ()=>{

    const create = useMutation({
        mutationFn:(data : any)=>{
            return api.put(`/coopOptions/${data.year}`, data)
                .then(e=>e.data)
        },
        onSuccess:(data : any)=>{
            queryClient.setQueryData([COOP_OPTION, {year:data.year}], data)
        }
    })



    return {create}
}