import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {getLedgerAcct, LEDGER_ACCT} from "../../../repositories/ledgerAcct";


const AccountName = ({id}: {id: string}) => {
    
    const {data: acct, isLoading} = useQuery({queryKey:[LEDGER_ACCT, {ledgerAcctId: id}], queryFn:()=>getLedgerAcct(id)});
    
    
    return <>
        {isLoading ? <Skeleton variant="text" width="100%" /> : acct.name }
    </>
    
    
}

export  default  AccountName