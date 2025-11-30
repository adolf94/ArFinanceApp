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


const selectionByHook  = async (destination : "debit" | "credit", hook : HookMessage, selectedConfig, fieldType)  =>  {
    let {type: tranType, debit, credit} = selectedConfig
    let key = destination == "credit" ? credit : debit
    let refName = getReferenceName(key,hook)
    if(!refName) return fieldType.map(e=>null) as  Promise<any>[]
    let hookRef = await queryClient.ensureQueryData({
        queryKey: [HOOK_REFERENCE, {referenceName: refName }],
        queryFn: ()=>getReferencesByName(refName),
        staleTime: 20000
    })


    let items = hookRef
    .filter(e=>e.type==tranType || (fieldType.length == 1 && fieldType[0] == "vendor" && e.vendorId != ""))
        // .filter(e=>(e.type == (tranType == "expense" ? "expense" : e.type)) || (fieldType.length == 1 && fieldType[0] == "vendor" && e.vendorId != "") )
        .sort((a,b)=>{
            const aIsTransfer = a.type === tranType;
            const bIsTransfer = b.type === tranType;

            if (aIsTransfer && !bIsTransfer) {
                return -1; // 'a' (transfer) comes before 'b'
            }
            if (!aIsTransfer && bIsTransfer) {
                return 1; // 'b' (transfer) comes before 'a'
            }

            // --- 2. Secondary Sort: 'hits' descending (greater value first) ---
            // If the types are the same (both transfer OR both not transfer), 
            // compare 'hits' in descending order.
            // b.hits - a.hits achieves descending sort.
            return b.hits - a.hits;
        })
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


export const   subtituteText = (template : string, hook:HookMessage) =>{
    let vars = template.match(/\$\{([$#\.a-zA-Z]+)\}/g)
    let current = template
    var getDataFromHook = (data)=>{
        let v = data.substring(2,data.length-1)
        let props = v.split(".")
        let hookItem = {...hook} as any
        for(let i=0; i < props.length; i++){
            if(i==0 && props[i] == "$"){
                hookItem = hookItem.extractedData
            } else if (i==0 && props[i] == "#") {
                hookItem = hookItem.jsonData
            }else{
                if(!hookItem.hasOwnProperty(props[i])){
                    return props[i]
                }
                hookItem = hookItem[props[i]]
                if(i == props.length - 1) return hookItem.toString();
            }
        }
    }

    if(vars == null) return template;
    let output = vars.reduce((p,c,i)=>{
        return p.replace(c,getDataFromHook(c))
    },template)
    return output

}


export default selectionByHook