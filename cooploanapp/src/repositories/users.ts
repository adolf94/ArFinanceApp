import { useMutation } from "@tanstack/react-query";
import api from "../components/api";
import { DisbursementAccount, User } from "FinanceApi";
import { queryClient } from "../App";


export const USER = "user";


export const getAll = ()=>{

    return api.get("/user")
        .then(res=>{
            
            return res.data
        })

}

export const getUserById = (userId : string)=>{

    return api.get(`/user/${userId}`)
        .then(res=>{
            return res.data as User
        })

}

export const useMutateUser = (id?:string)=>{
    const create = useMutation({
        mutationFn:(user:Partial<User>)=>{
            return api.post("/user", user)
                .then(res=>{
                    return res.data
                })
        },
        onSuccess : (data)=>{
            queryClient.invalidateQueries({queryKey:[USER,{userId:data.id}]})
        }
    })

    const update = useMutation({
        mutationFn:(user:Partial<User>)=>{
            return api.put(`/user/${user.id}`, user)
                .then(res=>{
                    return res.data
                })
        },
        onSuccess : (data)=>{
            queryClient.invalidateQueries({queryKey:[USER,{userId:data.id}]})
        }
    })

    const addDisbursement = useMutation({
        mutationFn:(acct:DisbursementAccount)=>{
            return api.post(`/user/${id!}/disbursementaccount`, acct)
                .then(res=>{
                    return res.data
                })
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:[USER]})
        }
    })


    return {create,update, addDisbursement};
}