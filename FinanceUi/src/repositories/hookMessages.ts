import { useMutation, useQueryClient } from "@tanstack/react-query";
import db from "../components/LocalDb/AppDb.js";
import { HookMessage } from "FinanceApi";
import fnApi from "../components/fnApi.js";


export const HOOK_MESSAGES = "hookMessages";

export const getHooksMessages = () => {

    return fnApi.get("/hookMessages")
        .then((response: any) => {
            db.hookMessages.bulkPut(response.data)
            return response.data;
        })

}

export const getHooksMessagesByMonth = (month:string) => {

    return fnApi.get(`/month/${month}/hookMessages`)
        .then(async (response: any) => {
            db.hookMessages.bulkPut(response.data)
            let existingkeys = response.data.map(e=>e.id)

            await db.hookMessages.where("monthKey").equals(month).toArray()
                .then(async e=>{
                    for(let i=0;i<e.length;i++){
                        if(existingkeys.indexOf(e[i].id) == -1){
                            await db.hookMessages.delete(e[i].id)
                        }
                    }
                })
            return response.data;
        })

}


export const getOneHookMsg = (id:string, month : string)=>{

    return fnApi.get(`/month/${month}/hookMessages/${id}`)
        .then((response:any) => {
            db.hookMessages.put(response.data)
            return response.data;
        })

}

export const mutateHookMessages = (id = "", month)=>{
    const queryClient = useQueryClient()
    const deleteHook = useMutation({
        mutationFn:()=>{
            return fnApi.delete(`/month/${month}/hookMessages/${id}`)
                .then(res=>res.data)
        },
        onSuccess:(data)=>{
            db.hookMessages.delete(id)
            queryClient.setQueryData([HOOK_MESSAGES, { monthKey: month}], (prevData : HookMessage[])=>prevData.filter(e=>e.id!=id))
        },
        onError:(err)=>{
            console.log(err)
        }

    })
    const deleteMany = useMutation({
        mutationFn:(many : string[])=>{
            return fnApi.delete(`/month/${month}/hookMessages`, {
                data: many
            }).then(res=>res.data)
        },
        onSuccess:(data : string[])=>{
            db.hookMessages.bulkDelete(data)
            queryClient.setQueryData([HOOK_MESSAGES, { monthKey: month}], (prevData : HookMessage[])=>prevData.filter(e=>data.includes(e.id)))
            return data
        },
        onError:(err)=>{
            console.log(err)
        }

    })

    return {deleteHook, deleteMany}
}