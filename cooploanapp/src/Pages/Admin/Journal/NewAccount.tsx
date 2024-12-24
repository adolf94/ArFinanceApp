import {Button, Dialog,
    DialogActions, DialogContent, DialogTitle, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material"
import React, { useEffect } from "react"
import { useState } from "react"
import {LedgerAccount} from "FinanceApi";
import {useMutateLedgerAcct} from "../../../repositories/ledgerAcct";
import { enqueueSnackbar } from "notistack";
import { useConfirm } from "material-ui-confirm";


const types = {
    "assets":"Assets",
    "receivables":"Receivables",
    "equity":"Equity",
    "liabilities":"Liabilities",
}

interface NewAccountProps {
    children: any,
    onCreate?: (newItem : LedgerAccount) => void,
    onCancel?: () => void,
    open?:boolean
}

type TYPE_KEYS = "assets" | "receivables" | "equity" | "liabilities"

const NewAccount = ({children, onCreate, onCancel, open: extOpen}: NewAccountProps) => {
  
    
    const [open,setOpen] = useState(extOpen)
    const [form, setForm] = useState({
        name : "",
        section : ""
    })
   const confirm = useConfirm()
    const {create} =  useMutateLedgerAcct()
    useEffect(() => {
        setOpen(extOpen)
    }, [extOpen]);
    
    
    const onSubmit = ()=>{
        if(!form.name || !form.section){
            enqueueSnackbar("Fill up required field", {variant:'success'})
            return;
        }
        confirm({title:"You are about to add a new account", confirmationText:"Add"})
            .then(()=>{
                create.mutateAsync(form)
                    .then((data)=>{
                        if(onCreate) onCreate(data)
                        onClose()
                    })

            })
    }

    
    const onClose = ()=>{
        setOpen(false)
        if(onCancel) onCancel()
        setForm({
            name : "",
            section : ""
        })
    }
    
    
    return <>
        { React.cloneElement( children, { onClick: ()=>setOpen(true) } ) }
        <Dialog open={!!open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="body1">Create Account</Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container sx={{pt:1}} spacing={2}>
                    <Grid size={12}>
                        <TextField label="Account Name" fullWidth value={form.name} onChange={(evt)=>setForm({...form,name:evt.target.value})} />
                    </Grid>
                    <Grid size={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-lab  el">Account Type</InputLabel>
                            <Select
                                value={form.section}
                                label="Account Type"
                                onChange={(evt)=>setForm({...form, section:evt.target.value})}
                            >
                                {Object.keys(types).map((key ) =><MenuItem value={key} key={key}>{types[key as TYPE_KEYS]}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onSubmit}>Submit</Button>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    
    </>
    
    
    
}
export default NewAccount