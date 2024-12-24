import { Dialog, DialogContent, Grid2 as Grid, Typography,  MenuItem, TextField, DialogActions, Button, Autocomplete, Box } from '@mui/material'
import {useEffect, useState } from "react"
import {LedgerAccount, User} from "FinanceApi";
import { DatePicker } from '@mui/x-date-pickers';
import  moment from 'moment';
import React from 'react';
import NumberInput from "../../../components/NumberInput.js";
import {MemberProfile} from "../../../@types/FinanceApi/memberProfile.js";
import {getAllLedgerAccts, LEDGER_ACCT} from "../../../repositories/ledgerAcct";
import { useQuery } from '@tanstack/react-query';
import NewAccount from "../Journal/NewAccount";

interface NewContributionDialogProps {
    member : MemberProfile & {user : User},
    forDate:string,
    index:number,
    onConfirm:(data:any)=>void,
    children: any
}


interface NewContributionForm {
    amount: number,
    destinationAcct: null | LedgerAccount,
    date: moment.Moment
}


const NewContributionDialog = ({member , index, forDate , onConfirm, children} : NewContributionDialogProps)=>{
    const [showNewLedgerAcct, setShowNewLedgerAcct] = useState<boolean>(false)
    const {data:accts, isLoading} = useQuery({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})
    const [show, setShow] = useState(false)
    const [form,setForm] = useState<NewContributionForm>({
        amount:0,
        destinationAcct: null,
        date: moment()
    })
    useEffect(() => {
        let amount = (member.initialAmount) + member.increments! * index
        setForm({...form, amount:amount})
    }, [member]);    
    
    const onOk = ()=>{

            setShow(false)
        onConfirm(form)
    }
    // @ts-ignore
    return <>
        { React.cloneElement( children, { onClick: ()=>setShow(true) } ) }
        <Dialog open={show} onClose={()=>setShow(false)}>
            <DialogContent>
                <Grid container >
                    <Grid size={12}>
                        <Typography variant="h6">New Contribution</Typography>
                    </Grid>
                    <Grid size={12} sx={{pt:1}}>
                        <TextField fullWidth label="Member" value={member.user.name} disabled />
                    </Grid >
                    <Grid size={6} sx={{pt:1}}>
                        <TextField fullWidth label="Contribution Date" value={forDate || ""} disabled />
                    </Grid>
                    <Grid size={6} sx={{pt:1}}>
                        
                        <DatePicker label="Date Received" value={form.date}
                        onAccept={newValue => setForm({...form, date:newValue!})}
                        slots={{
                            textField: (params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                />)
                        }} />
                    </Grid>
                    <Grid size={6} sx={{pt:1}}>
                        <NumberInput fullWidth label="Amount" value={form.amount || ""}  />
                    </Grid>
                    <Grid size={6} sx={{pt:1}}>

                        <Autocomplete
                            value={form.destinationAcct}
                            onChange={(_event, outValue ) => {
                                let  newValue = outValue as  LedgerAccount  & {createNew:boolean}

                                if(!!newValue?.createNew){
                                    setForm({ ...form, destinationAcct: form.destinationAcct||null});
                                    setShowNewLedgerAcct(true)
                                    return
                                }
                                setForm({ ...form, destinationAcct: newValue});
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
                            loading={ false }
                            fullWidth
                            options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: "assets"}].filter(e=>e.section=="assets")  }
                            renderInput={(params ) => <TextField {...params}
                                                                 label="Destination Account" />}
                        />

                    </Grid>
                </Grid>
                
            </DialogContent>
            <DialogActions>
                <Button>Cancel</Button>
                <Button variant="contained" onClick={onOk} disabled={!form.amount || !form.destinationAcct}>Add Contribution</Button>
            </DialogActions>
        </Dialog>
        <NewAccount open={showNewLedgerAcct} onCancel={()=>setShowNewLedgerAcct(false)} onCreate={(value)=>{ setForm({...form,destinationAcct:value})}}><Box></Box></NewAccount>
        
    </>
}

export default NewContributionDialog