import api from "../components/api"


export const HOOK_REFERENCE = "hookReference"



export const getReferencesByName = (name)=>{
   return api(`hookReference`, {
        params : {
            referenceName: name
        }
    }).then(data=>{
        return data.data
    })
}


export const logReferenceInstance = (data : any)=>{
    return api.put("hookReference", data)
        .then((res)=>{
            return res.data
        })
}