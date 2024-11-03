import { Dialog, DialogContent, Grid2 as Grid, Typography,  MenuItem, TextField, DialogActions, Button } from '@mui/material'
import {useEffect, useState } from "react"
import {User} from "FinanceApi";
import { DatePicker } from '@mui/x-date-pickers';
import  moment from 'moment';
import React from 'react';
import NumberInput from "../../../components/NumberInput.js";
import {MemberProfile} from "../../../@types/FinanceApi/memberProfile.js";

interface NewContributionDialogProps {
    member : MemberProfile & {user : User},
    forDate:string,
    index:number,
    onConfirm:(data:any)=>void,
    children: any
}

const NewContributionDialog = ({member , index, forDate , onConfirm, children} : NewContributionDialogProps)=>{
    const [show, setShow] = useState(false)
    const [form,setForm] = useState({
        amount:0,
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
                    <Grid size={12} sx={{pt:1}}>
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
                    <Grid size={6} sx={{pt:1,pl:1}}>
                        <NumberInput fullWidth label="Amount" value={form.amount || ""}  />
                    </Grid>
                </Grid>
                
            </DialogContent>
            <DialogActions>
                <Button>Cancel</Button>
                <Button variant="contained" onClick={onOk}>Add Contribution</Button>
            </DialogActions>
        </Dialog>
    </>
}

export default NewContributionDialog