import api from "../components/api.js";


export const HOOK_MESSAGES = "hookMessages";

export const getHooksMessages = ()=>{
    
    return api.get("/hookMessages")
        .then((response:any) => {
            
            return response.data;
        })
    
}


export const getOneHookMsg = (id:string)=>{

    return api.get(`/hookMessages/${id}`)
        .then((response:any) => {
            
            return response.data;
        })


}