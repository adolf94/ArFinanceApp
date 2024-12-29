import {Add, ExpandLess, ExpandMore } from "@mui/icons-material"
import { Box, Button, Grid2 as Grid, List, ListItem, ListItemButton, ListItemText, Skeleton } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {getAllLedgerAccts, LEDGER_ACCT} from "../../../repositories/ledgerAcct";
import {FormattedAmount} from "../../../components/NumberInput";
import NewAccount from "./NewAccount";
import LedgerAcctListItem from "./LedgerAcctListItem";



const LoadingAcctListItem = ()=>{
    
    return <>
        <ListItemText sx={{px:3}}>
            <Skeleton variant="text" />
        </ListItemText>
        <ListItemText sx={{px:3}}>
            <Skeleton variant="text" />
        </ListItemText>
        <ListItemText sx={{px:3}}>
            <Skeleton variant="text" />
        </ListItemText>
    </>
    
}

const Journal = ()=>{
    
    const [open,setOpen] = useState(true)
    const {data:accts, isLoading} = useQuery({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})
    
    return <Box sx={{width:'100%'}}>
        <Grid container>
            <Grid container size={12} sx={{justifyContent:'end'}}> 
                <Grid>
                    <NewAccount>
                        <Button variant="outlined"><Add /> New Account</Button>
                    </NewAccount>       
                </Grid>
            </Grid>
            <Grid size={{xs:12,md:6}}>
                <List>
                    <ListItemButton>
                        <ListItemText  primary="Assets"/>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {isLoading && <LoadingAcctListItem />}

                    {
                        !!accts && accts.filter(e=>e.section == "assets")
                            .map(e=><LedgerAcctListItem ledgerAcctId={e.ledgerAcctId} />)
                    }

                </List>
                <List>
                    <ListItemButton>
                        <ListItemText  primary="Receivables"/>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {isLoading && <LoadingAcctListItem />}

                    {
                        !!accts && accts.filter(e=>e.section == "receivables")
                            .map(e=><LedgerAcctListItem ledgerAcctId={e.ledgerAcctId} />)
                    }

                </List>
            </Grid>
            <Grid size={{xs:12,md:6}}>
                <List>
                    <ListItemButton>
                        <ListItemText  primary="Income/Expenses"/>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {isLoading && <LoadingAcctListItem />}

                    {
                        !!accts && accts.filter(e=>e.section == "income")
                            .map(e=><LedgerAcctListItem ledgerAcctId={e.ledgerAcctId} />)
                    }
                </List>
                <List>
                    <ListItemButton>
                        <ListItemText  primary="Equity"/>
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    {isLoading && <LoadingAcctListItem />}
                    {
                        !!accts && accts.filter(e=>e.section == "equity")
                            .map(e=><LedgerAcctListItem ledgerAcctId={e.ledgerAcctId} />)
                    }
                </List>
            </Grid>
        </Grid>
    </Box>
}
export default Journal