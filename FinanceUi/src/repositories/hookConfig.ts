import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"
import { queryClient } from "../App"
import replaceById from "../common/replaceById"

export const HOOK_CONFIG = "hookConfig"


export const getConfigsByType = (type)=>{

    return api.get(`types/${type}/hookConfigs`)
        .then(e=>{
            e.data.forEach(e => {
                queryClient.setQueryData([HOOK_CONFIG, {nameKey:e.nameKey}], e)
            });
            return e.data.sort((a,b)=>a.priorityOrder - b.priorityOrder)
        })
}


export const getConfigById = (id : string)=>{
    let type = id.split("_")[0] + "_"


    return api(`types/${type}/hookconfig/${id}`)
        .then(e=>{
            return e.data
        })
}

export const useMutateHookConfig = ()=>{


    const create = useMutation({
        mutationFn:(item:any)=>{
            return api.post("hookConfig", item)
                .then(e=>e.data)
        },
        onSuccess:(data)=>{
            queryClient.setQueryData([HOOK_CONFIG, {type:data.type}], (prev : any[])=>[...(prev||[]),data])
            queryClient.setQueryData([HOOK_CONFIG, {nameKey:data.nameKey}], data)
        }
    })

    const update = useMutation({
        mutationFn:(item:any)=>{
            return api.put(`hookConfig/${item.nameKey}`, item)
                .then(e=>item)
        },
        onSuccess:(data)=>{
            queryClient.setQueryData([HOOK_CONFIG, {type:data.type}], (prev : any[])=>replaceById(data, (prev || []), "nameKey"))
            queryClient.setQueryData([HOOK_CONFIG, {nameKey:data.nameKey}], data)
        }
    })

    return {create,update}
}