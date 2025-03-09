import api from "../components/api.js";


export const HOOK_MESSAGES = "hookMessages";

export const getHooksMessages = ()=>{
    
    return api.get("/hookMessages")
        .then((response:any) => {
            
            return response.data;
        })
    
    
}