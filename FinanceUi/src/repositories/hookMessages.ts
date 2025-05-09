import api from "../components/api.js";
import db from "../components/LocalDb/AppDb.js";


export const HOOK_MESSAGES = "hookMessages";

export const getHooksMessages = ()=>{
    
    return api.get("/hookMessages")
        .then((response:any) => {
            db.hookMessages.bulkPut(response.data)
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