    import { useMutation } from "@tanstack/react-query";
import api from "../components/api";
import {queryClient} from "../App";
import {LOAN} from "./loan";
import {LedgerAccount} from "FinanceApi";
import {LEDGER_ENTRY} from "./ledgerEntries";

export  const LEDGER_ACCT = "ledgeracct";


export const getAllLedgerAccts =  ()=> {
    
    return api.get<LedgerAccount[]>("/ledgeracct")
        .then(e=>{
            e.data.forEach((entry)=>{
                queryClient.setQueryData([LEDGER_ACCT, { ledgerAcctId: entry.ledgerAcctId}], entry)
            })        
            
            return e.data
        })
}


export const getLedgerAcct = (ledgerId: string, force:boolean = false) => {

    let acct = null
    let data = queryClient.getQueryData<LedgerAccount[]>([LEDGER_ACCT])
    
    if(!force) {
        if(!data) data = queryClient.ensureQueryData<LedgerAccount[]>({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})
        acct = data.find(e=>e.ledgerAcctId === ledgerId)
    }


    if(!!acct) return acct
    
    
    

    return api.get("ledgeracct/" + ledgerId).then((e) => {
        return e.data;
    });
    
}


export const useMutateLedgerAcct = ()=>{
    
    const create = useMutation({
        mutationFn: async (data : any)=>{
            return api.post<LedgerAccount>(`/ledgeracct`, data)
                .then((res)=> {
                   queryClient.invalidateQueries({queryKey: [LEDGER_ACCT]})
                    return res.data
                })
        }
    })
    
    return {create}
}