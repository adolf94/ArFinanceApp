import React, { useState, useEffect, useContext, ReactNode } from 'react'
import { List, Grid, Button, TextField, ListItem, FormLabel, createStyles, Portal, Autocomplete, Box, createFilterOptions, useTheme, useMediaQuery, IconButton } from '@mui/material'
import { SelectAccountContext } from "../NewRecord"
//import { makeStyles } from '@mui/styles'
import { DateTimePicker } from '@mui/x-date-pickers'
import { Link, useNavigate, useParams } from 'react-router-dom'
import moment from 'moment'
import SelectAccount from './SelectAccount'
import { useQuery } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { fetchVendors, useMutateVendor, VENDOR } from '../../repositories/vendors'
import { Calculate, Repeat as IcoRepeat } from '@mui/icons-material'
import { Transaction } from 'FinanceApi'
import { useMutateTransaction } from '../../repositories/transactions'
import NumberInput from '../../common/NumberInput'
import DropdownSelect from '../../common/Select'
import usePrevious from 'use-previous'
import cron from 'cron-parser'


//const usePlaceholderBlack = makeStyles((theme)=>({
//  input: {
//    '&::placeholder': {
//      fontColor: 'black',
//      fontStyle: 'italic',
//    },
//  },
//}));
const filter = createFilterOptions();

const cronOptions = [
  {name:"Monthly", cron: "0 0 DD *"},
  { name: "Twice a month 15/30", cron: "0 0 15,30 *" },

  ]

const CustomDateEndAdornment = (props : any) => {
  console.log([props])
  return <>
    {props.testParams}

  </>
}


const VendorTextField = (props) => {
  const [internalValue, setInternalValue] = useState("")
  const [focused, setFocused] = useState(false)
  const { data: vendors } = useQuery({ queryKey: [VENDOR], queryFn: fetchVendors })
  const mutateVendor = useMutateVendor()
  const view = useContext<any>(SelectAccountContext)
  const { transId } = useParams()
  
  const onTyped = (e) => {
    setInternalValue(e)
    props.onSearchChange(e)

  }

  const displayValue = () => {
    if (focused) {
      return internalValue || ""
    } else {
      return props.value?.name || ""
    }
  }


  const createNewVendor = (newVendor) => {
    mutateVendor.create({

      id: uuid(),
      name: newVendor,
      enabled: true
    }).then(e => {
      props.onChange  (e)
    })
  }





  return <>
      <Box sx={{ display: {lg:'block', xs:'none'} } }>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={vendors}
          fullWidth
          getOptionLabel={e => e.name}
          getOptionKey={ e=>e.id}
          value={props.value}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option.title);
            if (inputValue !== '' && !isExisting) {
              filtered.push({
                id: uuid(),
                name: `Add "${inputValue}"`,
              });
            }

            return filtered;
          }}
          onOpen={props.onClick}
          onChange={(event, newValue) => {
            if (typeof newValue === 'string') {
              createNewVendor(newValue)
            } else if (newValue && newValue.inputValue) {
              // Create a new value from the user input
              createNewVendor(newValue.inputValue)
            } else {
              props.onChange(newValue);
            }
          }}
          renderInput={(params) => <TextField {...params} variant="standard" />}
        />
      </Box>
    <Box sx={{ display: {sx:'block', lg:'none'} } }>
      <TextField fullWidth {...props} placeholder={(view.type == "vendor") ? (view.searchValue || props.value?.name) : (props.value?.name || "")}
      value={displayValue()} variant="standard"
      onFocus={() => {
        setFocused(true);
        setInternalValue("")
      }}
       onBlur={() => { setFocused(false) }}
       onChange={(e) => onTyped(e.target.value)}
        sx={{ input: { color: "black" }, "label": { color: "black" } }} 
      />
    </Box>
    </>


  //return <TextField fullWidth {...props} placeholder={(view.type == "vendor") ? (view.searchValue || props.value?.name) : (props.value?.name || "")}
  //  value={displayValue()} variant="standard"
  //  onFocus={() => {
  //    setFocused(true);
  //    setInternalValue("")
  //  }}
  //  onBlur={() => { setFocused(false) }}
  //  onChange={(e) => onTyped(e.target.value)}
  //  sx={{ input: { color: "black" }, "label": { color: "black" } }} 
}

const NewRecordForm = (props) => {
  const { formData,setFormData } = props
  const view = useContext<any>(SelectAccountContext)
  const mutateTransaction = useMutateTransaction()
  const navigate = useNavigate()
  const { transId } = useParams()
  const prevCronId = usePrevious(formData.cronId)
  const type = props.formData.type
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('lg'));
  const [recurring, setRecurring] = useState(false)  


  useEffect(() => {
    if(formData.cronId == prevCronId) return
    if(formData.cronId != "") setRecurring(true)
  }, [formData.cronId])

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


  const setType = (type) => { 
    switch (formData.type) {

      case "income":
        if (type == 'expense') setFormData({ ...formData, type, credit: formData.debit, creditId: formData.debit?.id, debit: null, debitId: null })
        if (type == 'transfer') setFormData({ ...formData, type, credit: formData.debit, creditId: formData.debit?.id, debit: null, debitId: null })
        break
      case "expense":
        if (type == 'income') setFormData({ ...formData, type, debit: formData.credit, debitId: formData.credit?.id, credit: null, creditId: null })
        if (type == 'transfer') setFormData({ ...formData,type, debit: null, debitId: null })
        break
      case "transfer":
        //const availAcct = credit || debit
        if (type == "income") setFormData({ ...formData, type, debit: formData.credit, debitId: formData.credit?.id , credit:null, creditId:null })
        if (type == 'expense') setFormData({ ...formData, type, credit: formData.credit, creditId: formData.credit?.id, debit:null, debitId:null }) 
        break


    }

    if(formData.type!=type)view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })
  }

  const submitTransaction =  () => {
    const newItem: Partial<Transaction> = {
        id: formData.id, 
        addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
      creditId: formData.creditId,
      debitId: formData.debitId,
      amount: formData.amount,
      vendorId: formData.vendorId,
      date: moment(formData.date).toISOString(),
      dateAdded: moment().toISOString(),
      description: formData.description || "",
      type:formData.type

    }

    if (transId == "new") {
      mutateTransaction.create(newItem)
        .then(() => {
          navigate("../records")
        })
    } else {
      mutateTransaction.update(newItem)
        .then(() => {
          navigate("../records")
        })
    }
    

  }


  const [selectAccountProps, setSelectProps] = useState({
      show: false,
      value: null,
      onChange: () => { },
      selectType: 'account',
      dest:"",
      typeId:""
    }) 

  const nextScheduledTrans = () => {
    let sched = cron.parseExpression(formData.cronExpression, {
        currentDate: moment(formData.date).toDate()
      })//new Cron.CronJob(formData.cronExpression, () => { }, () => { }, false,"Asia/Manila")
    //sched.setTime(new Cron.CronTime(moment(formData.date).toDate())) 
    return moment(sched.next().toDate()).toISOString();
  }

  return <>
    <List>
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
              //renderInput={(params) => <TextField {...params} value={moment(params.value).toLocaleString()} fullWidth variant="standard" onClick={() => view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })} />}*/}
              value={formData.date}

              onChange={(newValue: any) => {
                const cronExpression = formData.cronExpression
                  if(!!formData.cronId) moment(newValue).format(formData.cronId)

                setFormData({ ...formData, date: newValue.toISOString(), cronExpression })
              }}

              renderInput={(params) => <TextField
                {...params}
                value={moment(params.value).toLocaleString()} fullWidth variant="standard" onClick={(evt) => {
                  view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })
                    if(params.onClick) params.onClick(evt)
                  }
                }
                //ts-ignore
                InputProps={{
                  //ts-ignore
                  endAdornment: <>
                      {params.InputProps.endAdornment}
                    <IconButton>
                      <IcoRepeat onClick={() => {
                        setRecurring(!recurring)
                        if (!recurring) setFormData({ ...formData, cronId: '', cronExpression: '' }) // old value will be changed
                      }} />
                    </IconButton>
                    </>
                }} />

              }
            />
              {/*

              //ts-ignore
              slots={{
                textField: params => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (...props) => {
                        console.log()
                        return params.InputProps.endAdornment(...props)
                      }
                    }}

                  />
                )
              }}
              */}
        </Grid>
      </Grid>
      </ListItem>
      {recurring && <ListItem>
        <Grid container>
          <Grid item xs={4}>
            <FormLabel>Schedule</FormLabel>
          </Grid>
          <Grid item xs={8}>
            <DropdownSelect
              options={cronOptions} getOptionValue={opt => opt.cron}
              getOptionLabel={opt => opt.name}
              fullWidth
              size="small"
              value={cronOptions.find(e => e.cron === formData.cronId)}
              onChange={(value: { cron: string, name: string }) => {
                setFormData({
                  ...formData, cronId: value?.cron || "",
                  cronExpression: value ? moment(formData.date).format(value.cron) : ""
                })
              }}
            />
          </Grid>
        </Grid>
      </ListItem>}
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >{type=="transfer"?"From:":"Asset:"}</FormLabel>
        </Grid>
        <Grid item xs={8}>

            <TextField fullWidth autoComplete="off" variant="standard" 
                  value={type == 'income' ? formData.debit?.name || "" : formData.credit?.name || ""}
                  onClick={() => setSelectProps({ ...selectAccountProps, show: true, dest: "source" })}
                />
          </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >Vendor</FormLabel>
        </Grid>
        <Grid item xs={8}>
            <VendorTextField autoComplete="off" fullWidth view={view} variant="standard" value={formData.vendor} 
              onChange={value=>setFormData({ ...formData,vendor:value, vendorId:value.id})}
              onClick={() => setSelectProps({ ...selectAccountProps, show: true, dest: "vendor" })} />
              
        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >{ (type=="transfer"? "To" :type.charAt(0).toUpperCase() + type.slice(1)) + ":" }</FormLabel>
        </Grid>
        <Grid item xs={8}>
                 <TextField autoComplete="off" fullWidth variant="standard"
                  value={type == 'income' ? formData.credit?.name || "" : formData.debit?.name || ""}
                  onClick={() => setSelectProps({ ...selectAccountProps, show: true, dest: "destination" })}
                />


        </Grid>
      </Grid>
    </ListItem>
    <ListItem>
      <Grid container>
        <Grid item xs={4} alignItems="center">
          <FormLabel >Amount</FormLabel>
        </Grid>
          <Grid item xs={8}>
            {/*@ts-ignore*/}
            <NumberInput inputProps={{ min: 0, style: { textAlign: 'right' } }} fullWidth variant="standard" 
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e })}
              onClick={() => setSelectProps((prev) => ({ ...prev, dest: "amount" }))}
              InputProps={{
                endAdornment: <IconButton onClick={() => setSelectProps(prev=>({ ...selectAccountProps, show: true, dest: "amount" }))} ><Calculate /></IconButton>
              }}
            />
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
    <Portal container={props.selectPortal}>

      <SelectAccount show={selectAccountProps.show && selectAccountProps.dest == "source"} onChange={(value) => {
          setFormData({
              ...formData,
              [type == 'income' ? "debit" : "credit"]: value,
              [type == 'income' ? "debitId" : "creditId"]: value.id
            })
        }}
        onClose={() => setSelectProps({ ...selectAccountProps, show: false, dest: "" })}
        value={type =="income"?formData.debit:formData.credit}
        selectType='account'
        internalKey="destination"
        typeId="892f20e5-b8dc-42b6-10c9-08dabb20ff77" />

      <SelectAccount show={selectAccountProps.show && sm && selectAccountProps.dest == "vendor"} onChange={(value) => {
        setFormData({
          ...formData,
          vendor: value,
          vendorId: value.id
        })
      }}
        onClose={() => setSelectProps({ ...selectAccountProps, show: false, dest: "" })}
        value={ formData.vendor}
        selectType='vendor'
        internalKey="vendor"
        typeId="" />

      <SelectAccount show={selectAccountProps.show && selectAccountProps.dest == "destination"} onChange={(value) => {
        console.log(value)
        setFormData({
          ...formData,
          [type == 'income' ? "credit" : "debit"]: value,
          [type == 'income' ? "creditId" : "debitId"]: value.id
        })
      }}
        onClose={() => setSelectProps({ ...selectAccountProps, show: false, dest: "" })}
        value={type == "income" ? formData.credit : formData.debit}
        selectType='account'
        internalKey="destination"
        typeId={type == "transfer" ? "892f20e5-b8dc-42b6-10c9-08dabb20ff77" :
          (type == "expense" ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77" : "04c78118-1131-443f-2fa6-08dac49f6ad4")} />

      
      <SelectAccount show={selectAccountProps.show && selectAccountProps.dest == "amount"} onChange={(value) => {
        setFormData({
          ...formData,
          amount:value
        })
      }}
        onClose={() => setSelectProps({ ...selectAccountProps, show: false, dest: "" })}
        value={formData.amount}
        selectType='calculate'
        internalKey="amount" />
    </Portal>
  </>
}

export default NewRecordForm;