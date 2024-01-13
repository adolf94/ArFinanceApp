import React, { useState, useEffect, useContext } from 'react'
import { List, Grid, Button, TextField, ListItem, FormLabel, createStyles } from '@mui/material'
import { SelectAccountContext } from "../NewRecord"
import { makeStyles } from '@mui/styles'
import { DateTimePicker } from '@mui/x-date-pickers'
import { Link } from 'react-router-dom'
import usePrevious from 'use-previous'
import db from '../../components/LocalDb'
import moment from 'moment'
import { v4 as uid} from 'uuid'
import api from '../../components/api'


const usePlaceholderBlack = makeStyles((theme)=>({
  input: {
    '&::placeholder': {
      fontColor: 'black',
      fontStyle: 'italic',
    },
  },
}));


const VendorTextField = (props) => {
  const [internalValue, setInternalValue] = useState("")
  const [focused, setFocused] = useState(false)
  const view = useContext(SelectAccountContext)
  useEffect(() => {
    if (view.type == "vendor") {

    }
  }, [props.view, focused])

  const onTyped = (e) => {
    view.setViewContext({searchValue:e})
  }
            
  return <TextField fullWidth {...props} placeholder={(view.type == "vendor") ? (view.searchValue || props.value?.name) : (props.value?.name || "")}
    value={view.searchValue} variant="standard"
    onBlur={() => { setFocused(false) }}
    onChange={(e) => onTyped(e.target.value)}
    sx={{ input: { color: "black" }, "label": { color: "black" } }} 
  />
}

const NewRecordForm = (props) => {
  const { formData,setFormData } = props
  const view = useContext(SelectAccountContext)

  const type = props.formData.type
  const prevType = usePrevious(type)
  const prevDebit = usePrevious(formData.debit)
  const prevCredit = usePrevious(formData.credit)
  const [assetCredit,setAsset] = useState(null)

  const setType = (data) => setFormData({...formData, type: data})



  const actualData = () => {
    return formData
  }
  const getCallBack = (type, dataGetter) => {

    switch (type) {
      case "account":
        return (data) => {
          let dataToInput = dataGetter(data)
          setFormData({ ...(()=>(formData))(), ...dataToInput })
        }

      case "vendor":
        return (data) => {
          let dataToInput = dataGetter(data)
          setFormData({ ...(() => (formData))(), ...dataToInput })
        }
    }
    

  }

  useEffect(() => {
    switch (prevType) {

      case "income":
        if (type == 'expense') setFormData({ ...formData,credit: prevDebit, debitId: prevDebit?.id, debit: null, debitId: null })
        if (type == 'transfer') setFormData({ ...formData, credit: prevDebit, creditId: prevDebit?.id, debit: null, debit: null })
        break
      case "expense":
        if (type == 'income') setFormData({ ...formData, debit: prevCredit, debitId: prevCredit?.id, credit: null, creditId: null })
        if (type == 'transfer') setFormData({ ...formData, debit: null, debitId: null })
        break
      case "transfer":
        const availAcct = prevCredit || prevDebit
        if (type == "income") setFormData({ ...formData, debit: availAcct, debitId: availAcct?.id , credit:null, creditId:null })
        if (type == 'expense') setFormData({ ...formData, credit: availAcct, creditId: availAcct?.id }) 
        break


    }

    if(prevType!=type)view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })
  }, [type])

  const submitTransaction = async () => {

    const newItem = {
      id: uid(),
      credit: formData.credit,
      debit: formData.debit,
      creditId: formData.creditId,
      debitId: formData.debitId,
      amount: formData.amount,
      currAmount: formData.amount,
      date: formData.date,
      dateAdded: moment().toISOString(),
      isSaved:0
    }


    await db.transactions.put(newItem)
      .then((r) => {
        console.log(r)

        setFormData({
          type: formData.type,
          date: moment().toISOString(),
          credit: null,
          debit: null,
          amount: 0,
          vendor: null
        })
      })
    
    await db.transactions.where("isSaved").equals(0)
      .toArray().then((f) => {
        f.forEach(row => {
          api.post("transactions", row)
            .then(res => {
              console.log(res.data)
              db.transactions.bulkPut(res.data.transactions)
              db.accounts.bulkPut(res.data.accounts)
            }).then(e => {
              row.isSaved = 1
            })
        });
      });
  }



  return <List>
    <ListItem>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Button fullWidth variant={(type == "income" ? "contained" : "outlined")} onClick={() => setType("income")}>Income</Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant={(type == "expense" ? "contained" : "outlined")} onClick={() => setType("expense")}>Expense</Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant={(type == "transfer" ? "contained" : "outlined")} onClick={() => setType("transfer")}>Transfer</Button>
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel>Date/Time</FormLabel>
        </Grid>
        <Grid item xs={8}>
          <DateTimePicker
            renderInput={(params) => <TextField {...params} value={moment(params.value).toLocaleString()} fullWidth variant="standard" onClick={() => view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })} />}
            value={formData.date}

            onChange={(newValue) => {
              setFormData({...formData, date:newValue.toISOString()})
            }}
          />
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >{type=="transfer"?"From:":"Asset:"}</FormLabel>
        </Grid>
        <Grid item xs={8}>
          {
            (() => {
              const dest = type == 'income' ? { obj: 'debit', id: 'debitId' } : { obj: 'credit', id: 'creditId' }
              return <TextField fullWidth autoComplete="off" variant="standard" value={formData[dest.obj]?.name || ""} onClick={() => view.setViewContext({ type: 'account', groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: getCallBack("account", (d) => ({ [dest.obj]: d, [dest.id]: d?.id })) })} />
            })()
          }
          </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >Vendor</FormLabel>
        </Grid>
        <Grid item xs={8}>
          <VendorTextField autoComplete="off" fullWidth view={view} variant="standard" value={formData.vendor} onClick={() => view.setViewContext({ type: 'vendor', onChange: getCallBack("vendor", (d) => ({ "vendor": d, "vendorId": d?.id })) })} />
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >{ (type=="transfer"? "To" :type.charAt(0).toUpperCase() + type.slice(1)) + ":" }</FormLabel>
        </Grid>
        <Grid item xs={8}>
          {
            (() => {
              const dest = type == "income" ? { obj: "credit", id: 'creditId' } : { obj: 'debit', id: 'debitId' }
              const acct = type == "transfer" ? "892f20e5-b8dc-42b6-10c9-08dabb20ff77" : (type == "expense" ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77" :"04c78118-1131-443f-2fa6-08dac49f6ad4")
              return <TextField autoComplete="off" fullWidth variant="standard" value={formData[dest.obj]?.name || ""} onClick={() => view.setViewContext({ type: 'account', groupId: acct, onChange: getCallBack("account", (d) => ({ [dest.obj]: d, [dest.id]: d?.id })) })} />
              
            })()
          }
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >Amount</FormLabel>
        </Grid>
        <Grid item xs={8}>
          <TextField inputProps={{ min: 0, style: { textAlign: 'right' } }} fullWidth variant="standard" type="number" step="any"
            value={formData.amount} onBlur={(e) => setFormData({ ...formData, amount: (Math.round(e.target.value * 100) / 100).toFixed(2) })} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <TextField fullWidth label="Description" value={formData.description}
        onChange={(e) => setFormData({...formData, description:e.target.value})}
        variant="standard" maxRows="2" />
    </ListItem>
    <ListItem>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Button fullWidth variant="contained" onClick={submitTransaction}>Confirm</Button>
        </Grid>
        <Grid item xs={4}>
          <Link to="/records">

            <Button fullWidth variant="outlined" >Cancel</Button>
          </Link>
        </Grid>
      </Grid>
    </ListItem>
  </List>

}

export default NewRecordForm;