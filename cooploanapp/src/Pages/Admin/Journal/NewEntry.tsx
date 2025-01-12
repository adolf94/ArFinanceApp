import {DialogTitle, Dialog, Typography,  DialogContent, Grid2 as Grid, ButtonGroup, Button, Autocomplete, Box, TextField } from "@mui/material"
import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {getAllLedgerAccts, LEDGER_ACCT} from "../../../repositories/ledgerAcct";
import { useQuery } from "@tanstack/react-query";
import {LedgerAccount} from "FinanceApi";
import NewAccount from "./NewAccount";


interface NewEntryState {
    creditAcct: LedgerAccount | null,
    creditId: string,
    debitAcct: LedgerAccount | null,
    debitId: string,
}

const NewEntry = ({children} : {children:any})=>{
    
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const {data:accts, isLoading} = useQuery({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})
    const [showNewLedgerAcct, setShowNewLedgerAcct] = useState(false)
    const [type, setType] = useState({type:"transfer", creditFilter:"assets", debitFilter:"assets"})
    const [form,setForm] = useState<NewEntryState>({
        creditAcct: null ,
        creditId: "",
        debitAcct: null,
        debitId:""
    })
    
    const onClose = () => {
        setOpen(false)
    }
    
    
    return <>
        { React.cloneElement( children, { onClick: ()=>setOpen(true) } ) }

        <Dialog open={!!open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="body1">Add Entry</Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container margin={2}>
                    <Grid container size={12} sx={{justifyContent:'center'}}>
                        <ButtonGroup variant={"contained"}>
                            <Button variant={type.type=="transfer"?"outlined":"contained"}>Transfer</Button>
                            <Button variant={type.type=="expense"?"outlined":"contained"}>Expense</Button>
                            <Button variant={type.type=="income"?"outlined":"contained"}>Income</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
                <Grid container margin={2}>

                    <Autocomplete
                        value={form.creditAcct}
                        onChange={(_event, outValue ) => {
                            let  newValue = outValue as  LedgerAccount  & {createNew:boolean}

                            if(!!newValue?.createNew){
                                setForm({ ...form, creditAcct: form.creditAcct||null, creditId:""});
                                setShowNewLedgerAcct(true)
                                return
                            }
                            setForm({ ...form, creditAcct: newValue, creditId:newValue.ledgerAcctId});
                        }}
                        //@ts-ignore
                        renderOption={(props, option : LedgerAccount ) => {
                            const { key, ...optionProps } = props;
                            let opt = option as  LedgerAccount  & {createNew:boolean}
                            return (
                                <Box
                                    key={key}
                                    component="li"
                                    {...optionProps}
                                >
                                    {
                                        !opt.createNew ?
                                            <Box>{option.name}</Box> :
                                            <Box>Create new account</Box>
                                    }
                                </Box>
                            );
                        }}
                        getOptionKey={ e=>e.ledgerAcctId}
                        getOptionLabel={e=>e.name}
                        loading={ isLoading }
                        fullWidth
                        options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: "assets"}].filter(e=>e.section=="assets")  }
                        renderInput={(params ) => <TextField {...params}
                            // helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                                                             label="Source Account" />}
                    />
                </Grid>
            </DialogContent>
        </Dialog>
        <NewAccount open={showNewLedgerAcct} onCancel={()=>setShowNewLedgerAcct(false)} onCreate={(value)=>{ setForm({...form,sourceAcct:value,sourceAcctId:value.ledgerAcctId})}}><Box></Box></NewAccount>

    </>
}


export default NewEntry