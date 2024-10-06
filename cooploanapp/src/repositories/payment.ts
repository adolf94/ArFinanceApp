import { useMutation } from "@tanstack/react-query"
import api from "../components/api"



export const useMutatePayment = ()=>{


    const create = useMutation({
        mutationFn: (item : any )=>{
            return api.post("/payment", item)
                .then(res=>res.data)
        }
    })

    return {create}
}

