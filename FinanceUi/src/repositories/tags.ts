import { useMutation } from "@tanstack/react-query"
import api from "../components/fnApi"
import db from "../components/LocalDb"



export const TAG = "TAG"


export const GetAllTags = ()=>{

    return api.get("tags")
        .then((res)=>{
            return res.data
        })

}


export const useMutateTags = ()=>{


    const create = useMutation({
        mutationFn: (value)=>{
            return api.post("tags", {
                value,
                count:1
            }).then(e=>{
                return e.data
            })
        },
        onSuccess:(data)=>{
            db.tags.put(data)
        }
    })


    return {create}
}