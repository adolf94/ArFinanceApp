import { ListItem, ListItemText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {FormattedAmount} from "../../../components/NumberInput";
import {getLedgerAcct, LEDGER_ACCT} from "../../../repositories/ledgerAcct";

interface LedgerAcctListItemProps {
    ledgerAcctId : string;
    
}

const LedgerAcctListItem = (props:LedgerAcctListItemProps) => {
  
    const {data: item } = useQuery({queryKey: [LEDGER_ACCT,{ledgerAcctId : props.ledgerAcctId}], queryFn :()=>getLedgerAcct(props.ledgerAcctId, true)});
    
       
    return <ListItem >
        <ListItemText primary={item?.name} />
        <ListItemText sx={{textAlign:'right'}} primary={FormattedAmount(item?.balance)} />
    </ListItem>
}
export default LedgerAcctListItem