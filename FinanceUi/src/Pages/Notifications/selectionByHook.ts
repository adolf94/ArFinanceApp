import { queryClient } from "../../App"
import { getReferencesByName, HOOK_REFERENCE } from "../../repositories/hookReference"
import { ACCOUNT, fetchByAccountId } from "../../repositories/accounts"
import { fetchVendorById, VENDOR } from "../../repositories/vendors"




const selectionByHook = async (key : string, hook, tranType, fieldType)=>{
    let refName = ""
    if(key.substring(0,6) == "fixed|"){
        refName = key.substring(6, key.length)
    }else{
        refName = hook.extractedData[key]
    }
    
    let hookRef = await queryClient.ensureQueryData({
        queryKey: [HOOK_REFERENCE, {referenceName: refName }],
        queryFn: ()=>getReferencesByName(refName)
    })


    let items = hookRef.filter(e=>e.type==tranType || (fieldType == "vendor" && e.vendorId != ""))
        .sort((a,b)=>b.hits - a.hits)
    if(items.length == 0){
        return null
    }
    let selected = items[0]
    if(fieldType == "vendor"){
        if(!selected.vendorId) return null
        return await queryClient.ensureQueryData({
            queryKey: [VENDOR, {vendorId: selected.vendorId}],
            queryFn: ()=>fetchVendorById(!selected.vendorId)
        })
    }else{
        if(!selected.accountId) return null
        return await queryClient.ensureQueryData({
            queryKey: [ACCOUNT, {accountId:selected.accountId}],
            queryFn: ()=>fetchByAccountId(selected.accountId)
        })
    }
}

export default selectionByHook