import api from "../components/api";
import {LedgerAccount, LedgerEntry} from "FinanceApi";
import {queryClient} from "../App";
import {LEDGER_ACCT} from "./ledgerAcct";

export const LEDGER_ENTRY = "ledgerEntry"

export const getLedgerEntries = async () => {
    
    return api("/ledgerentry")
        .then(res=>res.data)
        
        ;
    
}

export const getLedgerEntriesBy = (by: string, month:string)=>{
    
    
    return api(`/ledgerentry/${month}/by${by}`).then(res=>res.data);
}


export const updateLedgerCache = (data : any)=>{

    if("relatedEntities" in data){
        const relatedEntities = data.relatedEntities;
        if("ledgerEntry" in relatedEntities){
            relatedEntities.ledgerEntry.map((entry : LedgerEntry)=>{
                queryClient.setQueryData([LEDGER_ENTRY, {by: 'eventDate', month: entry.monthGroup}], (prevData: LedgerEntry[])=>{
                    if(!prevData) return undefined
                    return [...(prevData || []), entry]
                })
            })
        }
        
        if("ledgerAccount" in relatedEntities){
            data.relatedEntities.ledgerAccount.map((entry : LedgerAccount)=>{
                queryClient.setQueryData([LEDGER_ACCT, { ledgerAcctId: entry.ledgerAcctId}], entry)
            })
        }
    }
    
    

}