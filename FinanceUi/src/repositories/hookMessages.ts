import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../components/api.js";
import db from "../components/LocalDb/AppDb.js";
import { HookMessage } from "FinanceApi";


export const HOOK_MESSAGES = "hookMessages";

export const getHooksMessages = () => {

    return api.get("/hookMessages")
        .then((response: any) => {
            db.hookMessages.bulkPut(response.data)
            return response.data;
        })

}

export const getHooksMessagesByMonth = (month:string) => {

    return api.get(`/month/${month}/hookMessages`)
        .then((response: any) => {
            db.hookMessages.bulkPut(response.data)
            let existingkeys = response.data.map(e=>e.id)

            return db.hookMessages.where("monthKey").equals(month).toArray()
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


export const getOneHookMsg = (id:string)=>{

    return api.get(`/hookMessages/${id}`)
        .then((response:any) => {
            db.hookMessages.put(response.data)
            return response.data;
        })

}

export const mutateHookMessages = (id, month)=>{
    const queryClient = useQueryClient()
    const deleteHook = useMutation({
        mutationFn:()=>{
            return api.delete(`/hookMessages/${id}`)
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

    return {deleteHook}
}