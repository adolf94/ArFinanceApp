import React, {useEffect, useState} from 'react'
import {Grid2 as Grid, List, ListItem,ListItemText, Divider, Button, Chip} from '@mui/material'
import useSubmitTransaction from "../NewRecordComponents/useSubmitTransaction";
import { faPersonMilitaryPointing } from "@fortawesome/free-solid-svg-icons";
import { CreateTransactionDto, HookMessage } from "FinanceApi";
import selectionByHook, { getReferenceName, subtituteText } from './selectionByHook';
import moment from 'moment';
import configs from './hooksMapping.json';
import { queryClient } from '../../App';
import db from '../../components/LocalDb';
import { fetchTransactionById } from '../../repositories/transactions';
import { useNavigate } from 'react-router-dom';


const HooksTransaction = ({hook, shown}: {hook:HookMessage, shown:boolean})=>{
    const [selected, setSelected] = useState<any>(null)
    const [confs, setConfs] = useState<any[]>([])
    const navigate = useNavigate()

    const [reference, setReference] = useState({
        vendor:"",
        credit:"",
        debit:""
    })
    const [initialized, setInitialized] = useState(false)
    const [formData,setFormData] = useState<CreateTransactionDto>({
        date: null,
        credit: null,
        debit: null,
        vendor:null,
        amount: 0,
        type:""
    })
    const submitTransaction = useSubmitTransaction({transaction:formData, schedule:null, notification: hook, hookConfig: selected, onConfirm:()=>{

    }} )

    useEffect(()=>{
        setConfs(()=>{
            return configs.filter(e=>e.config == hook.extractedData?.matchedConfig )
        })
    },[hook.extractedData?.matchedConfig])


    useEffect(()=>{
        if(!hook.transactionId) return
        if(!shown || initialized) return
        let type = "offline"
        db.transactions.filter(e=>e.id == hook.transactionId)
          .first().then(tr=>{
            if(!!tr){
                setFormData(tr)
                setInitialized(true)
                return
            } else {
    
                fetchTransactionById(hook.transactionId)
                .then(e=>{
                    setFormData(e)
                    setInitialized(true)
                })
            }
          })

    },[shown])



    const submittable = ()=>{
        if(!! formData.type &&
            !!formData.date &&
            !!formData.debit &&
            !!formData.credit &&
            !!formData.vendor            
        ) return true

        return false
    }
    const doSubmit =()=>{
        if(!submittable())return
        
    }    

    const updateSelected = async (selectedConfig)=>{
        setSelected(selectedConfig)
        let amount = hook.extractedData.amount;
  
  
        const isCreditRefSameAsVendor = selectedConfig.vendor == selectedConfig.credit
        const isDebitRefSameAsVendor = selectedConfig.vendor == selectedConfig.debit
        let vendor, credit, debit
  
        let references = {
          vendor : getReferenceName(selectedConfig.vendor, hook),
          credit : getReferenceName(selectedConfig.credit, hook),
          debit : getReferenceName(selectedConfig.debit, hook)
        }
  
  
  
        vendor = (!isCreditRefSameAsVendor&&!isDebitRefSameAsVendor) ?selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
          [ "vendor"]) : null
  
  
        let creditVendor = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, 
          [ "account", ...(isCreditRefSameAsVendor?["vendor"]:[]) ])
        
        let debitVendor = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
            [ "account", ...(isDebitRefSameAsVendor?["vendor"]:[]) ])
            
  
          setReference(references)
  
        await creditVendor.then(d=>{
          if(isCreditRefSameAsVendor) {
            [credit, vendor] = d
          } else { [credit] = d}
        })
        
        await debitVendor.then(d=>{
          if(isDebitRefSameAsVendor) {
            [debit, vendor] = d
          } else { [debit] = d}
        })
        // let vendor = selectionByHook(selectedConfig.vendor, hook, selectedConfig.type, "vendor")
        // let credit = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, "account")
        // let debit = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, "account")
        
        let availDate = hook.extractedData?.timestamp ?? hook.date
        let datetime = moment(availDate).toISOString();
          setFormData({
            ...formData,
            type:selectedConfig.type,
            date: datetime,
            amount,
            debit,
            credit,
            vendor,
            description: subtituteText(selectedConfig.remarks, hook) 
          })
  

    }


    return <>
    <Grid sm={12} sx={{textAlign:'center'}}>
                            {confs.map(e=><Chip label={e.displayName} color="primary" clickable
                            onClick={()=>updateSelected(e)}
                            variant={selected?.subConfig == e.subConfig ? "filled" : "outlined"}></Chip>)}
                        </Grid>
                        <Grid sm={12}>
                            <List>
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}><b>Date:</b> </Grid>
                                            <Grid size={{sm:8}}>{formData.date}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}><b>Credit:</b> </Grid>
                                            <Grid size={{sm:8}}>{formData.credit?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}><b>Debit:</b> </Grid>
                                            <Grid size={{sm:8}}>{formData.debit?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}><b>Vendor:</b> </Grid>
                                            <Grid size={{sm:8}}>{formData.vendor?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}><b>Amount:</b> </Grid>
                                            <Grid size={{sm:8}}>{formData.amount}</Grid>
                                            </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid size={{sm:4}}> </Grid>
                                            <Grid sm={8} sx={{alignItems:'right'}}>
                                                {
                                                    hook.transactionId ? <Button onClick={()=>navigate(`/transactions/${hook.transactionId}`)}>View</Button>
                                                        : <>
                                                        <Button disabled={!submittable()} >Submit</Button>
                                                        <Button onClick={()=>navigate(`/transactions/new?hookId=${hook.id}&date=${moment(hook.jsonData.timestamp).format("YYYY-MM-DD")}`)}>More</Button>
                                                    </>
                                                }
                                                
                                            </Grid>
                                        </Grid>} />
                                </ListItem>
                            </List>

                        </Grid>
    </>
}



export default HooksTransaction