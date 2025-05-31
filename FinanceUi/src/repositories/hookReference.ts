import api from "../components/api"
import fnApi from "../components/fnApi"


export const HOOK_REFERENCE = "hookReference"



export const getReferencesByName = (name)=>{
   return fnApi(`hookReference`, {
        params : {
            referenceName: name
        }
    }).then(data=>{
        return data.data
    })
}


export const logReferenceInstance = (data : any)=>{
    return fnApi.put("hookReference", data)
        .then((res)=>{
            return res.data
        })
}