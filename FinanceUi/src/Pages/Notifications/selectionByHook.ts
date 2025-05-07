import { queryClient } from "../../App"
import { getReferencesByName, HOOK_REFERENCE } from "../../repositories/hookReference"
import { ACCOUNT, fetchByAccountId } from "../../repositories/accounts"
import { fetchVendorById, VENDOR } from "../../repositories/vendors"
import { HookMessage } from "FinanceApi"

export const getReferenceName = (key : string, hook: HookMessage)=>{
    let refName = ""
    if(key.substring(0,6) == "fixed|"){
        refName = key.substring(6, key.length)
    }else{
        refName = hook.extractedData[key]
    }
    return refName;
}


const selectionByHook  = async (key : string, hook : HookMessage, tranType, fieldType)  =>  {
    
    let refName = getReferenceName(key,hook)
    
    let hookRef = await queryClient.ensureQueryData({
        queryKey: [HOOK_REFERENCE, {referenceName: refName }],
        queryFn: ()=>getReferencesByName(refName),
        staleTime: 20000
    })


    let items = hookRef.filter(e=>e.type==tranType || (fieldType.length == 1 && fieldType[0] == "vendor" && e.vendorId != ""))
        .sort((a,b)=>b.hits - a.hits)
    if(items.length == 0){
        return fieldType.map(e=>null) as  Promise<any>[]
    }
    let selected = items[0]
    return await Promise.all(fieldType.map(t=>{

        if(t == "vendor"){
            if(!selected.vendorId) return null
            return queryClient.ensureQueryData({
                queryKey: [VENDOR, {vendorId: selected.vendorId}],
                queryFn: ()=>fetchVendorById(selected.vendorId)
            })
        }else{
            if(!selected.accountId) return null
            return queryClient.ensureQueryData({
                queryKey: [ACCOUNT, {accountId:selected.accountId}],
                queryFn: ()=>fetchByAccountId(selected.accountId)
            })
        }
    }))


}

export default selectionByHook