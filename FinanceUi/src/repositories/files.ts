import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"
import { queryClient } from "../App"
import moment from "moment"
import { HOOK_MESSAGES } from "./hookMessages"


export const BLOB_FILE = "blobFile"

export const getFiles = ()=>{


    return api.get("files")
        .then(e=>e.data)

}


export const useMutateBlobFile = (id? : string | null | undefined)=>{

    const del = useMutation({
        mutationFn : (id)=>{
            return api.delete(`file/${id}`)
                .then(e=>id)
        },
        onSuccess: (data)=>{            
            queryClient.setQueryData(
                 [BLOB_FILE],
                (prev: any[])=>{
                    if (!prev) return undefined
                    return [...prev].filter(e=>e.id!=data) 
                },
                
            )
        }   
    })
    const regenerateAiData = useMutation({
        mutationFn:()=>{
            return api(`/file/${id}/aidata`, {params:{action:"regenerate"}})
                .then((res)=>{
                    return res.data
                })
        }, onSuccess:(data)=>{

            let item
            queryClient.setQueryData([BLOB_FILE], (prev: any[])=>{
                
                item = prev.find(e=>e.id == id)
                if(!item) return prev
                item.aiData = data
                item.aiReviewed = false
                return [...prev];
            })

            let monthKey = moment(data.dateTime?.datetime || data.dateCreated).format("YYYY-MM-01")
                
            queryClient.setQueryData([HOOK_MESSAGES,  { monthKey: monthKey}], (prev: any[])=>{
                if(!prev) return undefined
                item = prev.find(e=>e.jsonData?.imageId == id)
                if(!item) return prev
                item.extractedData = data
                return [...prev];
            })
        }
    })
    const updateAiData = useMutation({
        mutationFn:({id,data} : any)=>{
            return api.put(`/files/${id}/aidata`,data)
                .then(()=>{
                    let item
                    queryClient.setQueryData([BLOB_FILE], (prev: any[])=>{
                        
                        item = prev.find(e=>e.id == id)
                        if(!item) return prev
                        item.aiData = data
                        item.aiReviewed = true
                        return [...prev];
                    })

                    let monthKey = moment(data.dateTime?.datetime || data.dateCreated).format("YYYY-MM-01")
                        
                    queryClient.setQueryData([HOOK_MESSAGES,  { monthKey: monthKey}], (prev: any[])=>{
                        if(!prev) return undefined
                        item = prev.find(e=>e.jsonData?.imageId == id)
                        if(!item) return prev
                        item.extractedData = data
                        return [...prev];
                    })
                    return null;
                })
        },onSuccess:(d)=>{
return d
        }
    })
    return {del,updateAiData,regenerateAiData}
}