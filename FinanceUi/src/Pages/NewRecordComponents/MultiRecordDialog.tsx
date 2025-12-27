import { Dialog, Button, DialogContent,Grid2 as Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, InputAdornment, DialogActions } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import NumberInput from "../../common/NumberInput"
import AccountAutocomplete from "./AccountAutocomplete"
import { Add, AddCircle, CheckCircle, Lock, LockOpen, RemoveCircle } from "@mui/icons-material"
import { defaultValue } from "./NewRecordForm"
import {v7 as uuid } from 'uuid'
import VendorTextField from "./VendorTextField"
import React from "react"
import { useSaveMultipleTransaction } from "./useSubmitTransaction"
import { useNavigate, useParams } from "react-router-dom"
import { i } from "mathjs"



const typeColors = {
    "expense":"error",
    "transfer":"primary",
    "income":"success"
}

const typeIds = {
    "expense":"error",
    "transfer":"primary",
    "income":"success"
}


const RecordRow = ({data, onChange,onAcctSelect, onAddClicked, i})=>{
    
  const [form,setForm] = useState(data)

  const isSubmittable = (form) => {
      const { creditId, debitId, vendorId, amount} = form;
      if (!(creditId && debitId && vendorId)) return false;

      if(amount === null || amount === undefined) return false;
      return true;
  }

  const updateForm = (newValue, shouldEmit = false)=>{
    setForm(newValue)
    if(shouldEmit){
        onChange({...newValue, submittable : isSubmittable(newValue)})
    }
  }

  const selectDefault = (acct)=>{
    if(i != 0) return
    onAcctSelect(acct)
  }
  useEffect(()=>{
    setForm(data)
  },[data])

  const setType = (type) => {
    let newValue
    switch (form.type) {
      case "income":
        if (type === "expense")
          newValue = ({
            ...form,
            type,
            credit: form.debit,
            creditId: form.debit?.id,
            debit: null,
            debitId: null,
          });
        if (type === "transfer")
          newValue = ({
            ...form,
            type,
            credit: form.debit,
            creditId: form.debit?.id,
            debit: null,
            debitId: null,
          });
        break;
      case "expense":
        if (type === "income")
          newValue = ({
            ...form,
            type,
            debit: form.credit,
            debitId: form.credit?.id,
            credit: null,
            creditId: null,
          });
        if (type === "transfer")
          newValue = ({ ...form, type, debit: null, debitId: null });
        break;
      case "transfer":
        //const availAcct = credit || debit
        if (type === "income")
          newValue = ({
            ...form,
            type,
            debit: form.credit,
            debitId: form.credit?.id,
            credit: null,
            creditId: null,
          });
        if (type === "expense")
          newValue = ({
            ...form,
            type,
            credit: form.credit,
            creditId: form.credit?.id,
            debit: null,
            debitId: null,
          });
        break;
    }
    updateForm(newValue, true)
  };

  

    return <Grid container columns={25}>
            <Grid size={7} sx={{pl:1}}>
                <TextField label="Description" size="small" fullWidth
                    value={form.description || ""}
                    onChange={(evt)=>updateForm({...form, description:evt.target.value})}/>
            </Grid>
            <Grid size={2} sx={{pl:1}}>
                <Button variant="contained" size="small" color={typeColors[form.type]} fullWidth
                    onClick={()=>{ 
                        switch(form.type) {
                            case "expense":
                                setType("transfer")
                                break
                            case "transfer":
                                setType("income")
                                break
                            case "income":
                                setType("expense")
                                break
                        }
                    }}
                >{form.type}</Button>
            </Grid>
            <Grid size={3} sx={{pl:1}}>
                <VendorTextField  variant="outlined" size="small" disablePortal={false} value={form.vendor}
                    onChange={(_,v)=>updateForm({...form, vendor:v, vendorId:v.id}, true)}
                />
            </Grid>
            <Grid size={4} sx={{pl:1}}>
                <AccountAutocomplete type="transfer" disabled={i!=0}
                    value={form.type == "income" ? form.debit : form.credit} size="small"
                    onChange={(data)=>{
                        let dest = form.type == "income" ? "debit":"credit"
                        updateForm({...form,[dest]:data,[`${dest}Id`]:data.id}, true)
                        selectDefault(data)
                    }}
                />
            </Grid>
            <Grid size={4} sx={{pl:1}}>
                <AccountAutocomplete type={form.type} value={form.type == "income" ? form.credit : form.debit} size="small"
                    onChange={(data)=>{
                        let dest = form.type == "income" ? "credit":"debit"
                        updateForm({...form,[dest]:data,[`${dest}Id`]:data.id}, true)
                    }}/>
            </Grid>
            <Grid size={3} sx={{pl:1}}>
                <NumberInput variant="outlined" size="small" slotProps={{input:{min: 0,
                    sx:{ textAlign: "right" }}}}
                    value={form.amount}
                    onBlur={v=>updateForm(form, true)}
                    onChange={(v)=>updateForm({...form, amount:v})}
                    />
            </Grid>
            <Grid size={2} sx={{pl:1}}>
                <IconButton onClick={onAddClicked}>
                    <AddCircle fontSize="small"/>
                </IconButton>
                <IconButton onClick={onAddClicked}>
                    <RemoveCircle fontSize="small"/>
                </IconButton>
            </Grid>
        </Grid>
}
const DifferenceRow = ({ data,amount, onFocus})=>{

    return <Grid container  columns={25}>
            <Grid  size={7} sx={{pl:1}}>
                <TextField label="Description" size="small" fullWidth
                    value=""
                    onFocus={()=>onFocus()}/>
            </Grid>
            <Grid size={2} sx={{pl:1}}>
                <Button variant="contained" size="small" color="error" fullWidth
                onClick={()=>onFocus({type:"transfer"})}
                >Expense</Button>
            </Grid>
            <Grid size={3} sx={{pl:1}}>
                <VendorTextField  variant="outlined" size="small" disablePortal={false} onFocus={(evt)=>{
                    evt.preventDefault()
                    onFocus()
                    evt.target.blur()
                }}
                />
            </Grid>
            <Grid size={4} sx={{pl:1}}>
                <AccountAutocomplete value={null} size="small" onFocus={(evt)=>{
                    evt.preventDefault()
                    onFocus()
                    evt.target.blur()
                }} />
            </Grid>
            <Grid size={4} sx={{pl:1}}>
                <AccountAutocomplete value={null} size="small" onFocus={(evt)=>{
                    evt.preventDefault()
                    onFocus()
                    evt.target.blur()
                }} />
            </Grid>
            <Grid size={3} sx={{pl:1}}>
                <NumberInput variant="outlined" size="small" slotProps={{input:{min: 0,
                    sx:{ textAlign: "right" }}}}
                    value={amount} onFocus={()=>onFocus()}
                    />
            </Grid>
            <Grid size={2} sx={{pl:1}}>
                <IconButton onClick={()=>onFocus()}>
                    <AddCircle fontSize="small"/>
                </IconButton>
                <IconButton onClick={()=>onFocus()}>
                    <RemoveCircle fontSize="small"/>
                </IconButton>
            </Grid>
        </Grid>
}


const MultiRecordDialog = ({children,formData, notification, conf})=>{
    const [open,setOpen] = useState(false)

    const { transId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([{...defaultValue, id: uuid(),...(formData || {})}])
    const [total,setTotal] = useState(0)
    const [submittable,setSubmittable] = useState(false)
    const [acct,setAcct] = useState(null)
    const [loading,setLoading] = useState(false)
    const [calculate,setCalculate] = useState({
        total:0,
        remaining:0
    })
    const [lock,setLock] = useState(false)
    const {updateTransaction:update, newTransaction:create} = useSaveMultipleTransaction()
    const updateData = (data,i)=>{
        setData((prev)=>{
            let state = [...prev]
            state[i] = {...data}
            return state;
        })
    }

    useEffect(()=>{
        let currentTotal = Math.abs(data.reduce((p,v,i)=>{
            return p + (v.amount * (v.type == "income" ? -1:1))
        },0))

        const isSubmittable = data.every(e=>e.submittable) && total == currentTotal
        setSubmittable(isSubmittable)


        if(!lock){
            setTotal(currentTotal)
            setCalculate({
                total:currentTotal,
                remaining:0
            })
        }else{
            setCalculate({
                total: currentTotal,
                remaining: total - currentTotal
            })
        }
    },[data])

    useEffect(()=>{
        setData([{...defaultValue, id: uuid(),...(formData || {})}])
        setTotal(formData?.amount || 0)
        console.log(Number.parseFloat(formData?.amount) != 0)
        setLock(Number.parseFloat(formData?.amount||0) != 0)
        setCalculate({
            total: formData?.amount || 0,
            remaining: 0
        })
    }, [formData])

    useEffect(()=>{
        setCalculate({
            total:calculate.total,
            remaining:total - calculate.total
        })
    },[total])

    const onDefaultAcctSelected = (data)=>{
        setAcct(data)
        setData(prev=>{
            let state = [...prev]
            return state.map(item=>{
                let dest = item.type == "income"? "debit":"credit"
                return {
                    ...item,
                    [dest]:data,
                    [`${dest}Id`]:data.id
                }
            })
        })
    }

    const onInsertNew = ()=>{

        let newItem = {
            ...defaultValue,
            "credit": acct,
            "creditId":acct?.id,
            amount: Math.abs(calculate.remaining)
        }
        setData([...data, newItem])

    }
    const saveTransactions = async ()=>{
        setLoading(true)
        for(let i = 0; i < data.length ; i++){
          let newItem = data[i]; 
          if(i==0 && transId != "new"){
            await update(newItem)
          }else {
            await create(i, {...newItem,notifications:formData.notifications}, notification, conf)
          }
        }
        setLoading(false)
        navigate(-1)
    }

    return <>
        {
            React.cloneElement(children, {onClick:()=>setOpen(true)})
        }
        <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="xl" fullWidth>
        <DialogContent>
            {data.map((row,i)=><RecordRow key={row.id} i={i} data={row} onChange={(data)=>updateData(data,i)} onAcctSelect={onDefaultAcctSelected} onAddClicked={onInsertNew}/>)}
            {calculate.remaining != 0 && <DifferenceRow onFocus={onInsertNew} amount={Math.abs(calculate.remaining)}/>}
            <Grid container sx={{pt:1}} columns={25}>
                <Grid  size={7} sx={{pl:1}}>
                </Grid>
                <Grid  size={2} sx={{pl:1}}>
                </Grid>
                <Grid  size={3} sx={{pl:1}}>
                </Grid>
                <Grid  size={4} sx={{pl:1}}>
                </Grid>
                <Grid sx={{pt:1,pl:1, fontWeight:"bold", textAlign:"right"}} size={4} >
                    Total:
                </Grid>
                <Grid size={3} sx={{pl:1}}>
                        
                    <NumberInput variant="outlined" size="small"
                        slotProps={{
                            input:{
                                min: 0,
                                endAdornment: <InputAdornment position="end">
                                    <IconButton size="small" onClick={()=>setLock(!lock)}>
                                        {
                                            lock? <Lock fontSize="small"/> : <LockOpen fontSize="small"/>
                                        }
                                    </IconButton>
                                </InputAdornment>
                            },
                        }}
                        value={total}
                        onChange={(v)=>{
                            setTotal(v)
                        }}
                        onBlur={()=>{
                            setLock(true)
                        }}
                        />
                </Grid>
                <Grid size={2} sx={{pl:1}}>
                    <Button variant="outlined" disabled={!submittable || loading} onClick={saveTransactions}>Confirm</Button>
                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>
    </>
}

export default MultiRecordDialog