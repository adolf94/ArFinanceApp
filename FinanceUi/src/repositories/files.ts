import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"
import { queryClient } from "../App"


export const BLOB_FILE = "blobFile"

export const getFiles = ()=>{


    return api.get("files")
        .then(e=>e.data)

}


export const useMutateBlobFile = ()=>{

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
    return {del}
}