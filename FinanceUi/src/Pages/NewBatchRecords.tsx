import { Add, CheckBox, Delete, GppBad, Receipt } from "@mui/icons-material"
import { AppBar, Box, Button, ButtonGroup, Card, CardContent, Checkbox, FormControlLabel, FormLabel, Grid2 as Grid, IconButton, InputAdornment, Stack, TextField, Toolbar, Typography } from "@mui/material"
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment"
import { useEffect, useMemo, useRef, useState } from "react"
import {v7 as uuid} from 'uuid'
import NumberInput from "../common/NumberInput"
import Records from "./Records"
import SelectAccount from "../components/NewComponents/SelectAccount"
import { grey } from "@mui/material/colors"
import numeral from "numeral"
import SelectorDrawer from "../components/NewComponents/SelectorDrawer"
import { Transaction } from "../components/LocalDb/AppDb"
import { useMutateTransactionGroup } from "../repositories/transactionGroup"
import useSubmitTransaction, { useSaveMultipleTransaction } from "./NewRecordComponents/useSubmitTransaction"
import { iteratee } from "underscore"
import { fetchTransactionById } from "../repositories/transactions"


const BatchLineItem = ({item})=>{
    const [form,setForm] = useState({
      id:uuid(),
      amount:0,
      linked: "transaction",
      expense: null,
      expenseId:null,
      description:""

    })


    useEffect(()=>{
      setForm(item)
    },[item])


    const [selectorConfig, setSelectorConfig] = useState({
      value:null,
      type:"expense",
      onChange:()=>{},
      show: false
    })

  
    return <Box sx={{pt:1}}>
        <SelectAccount {...selectorConfig} />
      <Card elevation={0} sx={{backgroundColor:"#f9f9f9"}}>
        <CardContent sx={{pb:0,mb:0}}>
          <Grid container>
            <Grid size={8} sx={{pt:1}}>
              <TextField size="small" label="Product / Description" value={form.description} fullWidth multiline rows={2} sx={{ "& fieldset": {
                border: 'none', // Removes the border
                  }}}/>
          <Box sx={{display:'flex', justifyContent:"space-between"}}>
                  <Button variant="text"  
                  size="small"
                    onClick={()=>{
                        setSelectorConfig({
                          show:true,
                          value:form.expense,
                          onChange:(value, shouldClose)=>{
                            setForm({...form, expense:value, expenseId:value.id})
                            if(shouldClose) setSelectorConfig({...selectorConfig, show:false})
                          },
                          type:"account"
                        })
                      }}
                    sx={{
                        justifyContent: 'space-between', borderColor: 'grey.200', textTransform:"unset"}}>
                    {form.expense?.name || 'Category'}
                  </Button>
                  <Box>
                    <FormControlLabel control={<Checkbox size="small" />} label="Refunded Item" />
                  </Box>
                </Box>
            </Grid>
            <Grid size={4}>
              <Stack>
                <Box >
                  <NumberInput size="small" variant="outlined" fullWidth value={form.amount} onChange={(e)=>setForm({...form,amount:e})}
                  sx={{ "& fieldset": {
                    border: 'none', // Removes the border
                  }}}
                  slotProps={{
                    input:{
                      endAdornment:<InputAdornment position="end">
                        <IconButton>
                            <Delete fontSize="small" color={grey[200]}/>
                        </IconButton>
                      </InputAdornment>
                    },
                    htmlInput:{
                      style:{fontSize:"1.5rem"}
                    }
                  }}/>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
}


const NewBatchRecords = ()=>{
    const topBarRef = useRef()
    const [form,setForm] = useState({
      id: uuid(),
      date: moment().format("YYYY-MM-DD"),
      account: null,
      accountId: null,
      vendor:null,
      vendorId:null,
      items:[{
        id:uuid(),
        isDefault: true,
        amount:0,
        linked: "transaction",
        expense: null,
        expenseId:null,
        description:"",
        isNew:true
      }],
      total:0
    })
    const [selectorConfig, setSelectorConfig] = useState({
      value:null,
      type:"account",
      onChange:()=>{},
      show: false
    })
    const [trSelector, setTrSelector] = useState({
      value:null,
      type:"transaction" as "transaction" | "asset",
      filters:{
        date:moment().format("YYYY-MM-DD"),
        account:[],
        vendor:[]
      },
      onChange:()=>{},
      open: false
    })
    const mutateGroup = useMutateTransactionGroup()
    const tr = useSaveMultipleTransaction()

    const currentTotal = useMemo(()=>{
      return form.items.reduce((p,c)=>{
        return p + c.amount
      },0)
    },[form.items])

    const importTransaction = (d:Transaction)=>{
      var newItem = {
        id:d.id,
        linked:"transaction",
        description:d.description,
        expense: d.debit,
        expenseId: d.debitId,
        amount:d.amount,
        isDefault:false,
        isNew:false
      }

      if(form.items.length == 1 && form.items[0].isDefault){
        setForm({...form,items:[newItem]})
      }else{
        setForm({...form,items:[...form.items,newItem]})
      }
    }

    const saveTransaction = async ()=>{
      let output = []
      for( let i =0; i<form.items.length;i++){
        let transaction = form.items[i]
        if(transaction.linked == "transaction"){
          if(transaction.isNew){
            const newItem: Partial<Transaction> = {
                id: transaction.id,
                groupId: form.id,
                addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
                creditId: form.accountId,
                debitId: transaction.expenseId,
                amount: transaction.amount,
                vendorId: form.vendorId,
                vendor:form.vendor,
                date: moment(form.date).toISOString(),
                dateAdded: moment().toISOString(),
                reference: "",
                description: (transaction.description || ""),
                type: "expense",
                scheduleId: null,
                notifications:[],
                tags : []
              };
              await tr.newTransaction(0,newItem, null, null)
          }else{
            var toEdit = await fetchTransactionById(transaction.id)
             const newItem: Partial<Transaction> = {
                ...toEdit,
                groupId: form.id,
                addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
                creditId: form.accountId,
                debitId: transaction.expenseId,
                amount: transaction.amount,
                vendorId: form.vendorId,
                date: moment(form.date).toISOString(),
                description: (transaction.description || ""),
                type: "expense"
              };
              await tr.updateTransaction(newItem)
          }
        }
      }
      mutateGroup.create.mutateAsync(form)
    }

    return <>
        
        <SelectAccount {...selectorConfig} onClose={()=>setSelectorConfig({...selectorConfig, show:false})}/>
        <SelectorDrawer {...trSelector} onClose={()=>setTrSelector({...trSelector, open:false})}/>
        <AppBar position="static"  color="primary" ref={topBarRef}>
          <Toolbar>
            <Grid container sx={{justifyContent: "space-between"}}>
              <Grid>

                <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                    Notification and Hooks
                </Typography>
                  
              </Grid>
            </Grid>

          </Toolbar>
        </AppBar>
        <Grid container width="100%" spacing={1} sx={{justifyContent:"center", pt:2}}>
          <Grid size={{xs:12,md:8}} sx={{p:1}}>
            <Card elevation={2}>
              <CardContent>
                <Grid container>
                  <Grid size={{md:3,xs:12}} sx={{p:1}}>
                    <Typography variant="formlabel" sx={{pb:1}} >Date:</Typography>
                    <DatePicker  value={moment(form.date)} slots={{
                      textField:(props)=><TextField {...props} fullWidth size="small"/>
                    }}/>
                  </Grid>
                  <Grid size={{md:3,xs:12}} sx={{p:1}}>
                    <Typography variant="formlabel" sx={{pb:1}} >Account:</Typography>
                    <Button variant="outlined" fullWidth
                      onClick={()=>{
                        setSelectorConfig({
                          show:true,
                          value:form.account,
                          onChange:(value, shouldClose)=>{
                            setForm({...form, account:value, accountId:value.id})
                            if(shouldClose) setSelectorConfig({...selectorConfig, show:false})
                          },
                          type:"account"
                        })
                      }}
                    sx={{
                          justifyContent: 'space-between', borderColor: 'grey.200'}}>
                      {form.account?.name || 'Choose'}
                      <Box sx={{ opacity: 0.3, display: 'flex' }}><Add /></Box>
                    </Button>
                  </Grid>
                  <Grid size={{md:3,xs:12}} sx={{p:1}}>
                    <Typography variant="formlabel" sx={{pb:1}} >Vendor:</Typography>
                    <Button variant="outlined" fullWidth 
                      onClick={()=>{
                          setSelectorConfig({
                            show:true,
                            value:form.vendor,
                            onChange:(value, shouldClose)=>{
                              setForm({...form, vendor:value, vendorId:value.id})
                              if(shouldClose) setSelectorConfig({...selectorConfig, show:false})
                            },
                            type:"vendor"
                          })
                        }}
                      sx={{
                          justifyContent: 'space-between', borderColor: 'grey.200'}}>
                      {form.vendor?.name || 'Choose'}
                      <Box sx={{ opacity: 0.3, display: 'flex' }}><Add /></Box>
                    </Button>
                  </Grid>
                  <Grid size={{md:3,xs:12}} sx={{p:1}}>
                    <Typography variant="formlabel" sx={{pb:1}} >Target Total:</Typography>
                    <NumberInput value={form.total} variant="outlined" size="small" onChange={(v)=>setForm({...form,total:v})}/>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{xs:12,md:8}} sx={{my:1,p:1}}>
              <Stack>
                <Box sx={{display:"flex",justifyContent: 'space-between', alignItems: 'center'}}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt  /> Line-Item Breakdown
                  </Typography>
                  <Button 
                    size="small" 
                    variant="text" 
                    // onClick={() => openDrawer('Pick Record', 'HISTORY_PRODUCT', 'bulk')}
                    onClick={()=>setTrSelector({
                      value:null,
                      type:"transaction",
                      filters:{
                        date:moment().format("YYYY-MM-DD"),
                        account:!!form.account?[form.account]:[],
                        vendor:!!form.vendor?[form.vendor]:[]
                      },
                      onChange:(data)=>{
                        importTransaction(data)
                        setTrSelector({...trSelector, open:false})
                      },
                      open: true
                    })}
                    sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'primary.main' }}
                  >
                    + Import from History
                  </Button>
                </Box>
                {form.items.map(e=><BatchLineItem item={e} />)}
                <ButtonGroup  sx={{mt:2}}>
                  <Button variant="text" > <Add /> Add new item</Button>    
                  <Button variant="text"> <GppBad /> Refunded Item</Button>    
                </ButtonGroup>               
              </Stack>
          </Grid>
          <Grid size={{xs:12,md:8}}>
              <Card>
                <CardContent>
                  <Grid sx={{display:'flex', justifyContent:"space-between"}}>
                    <Box sx={{textAlign:'left'}}>
                      <Typography variant="caption">Current Total</Typography>
                      <Typography variant="h5">{numeral(currentTotal).format("0,0.00")}</Typography>
                    </Box>
                    <Box sx={{textAlign:'right'}}>
                      <Typography variant="caption">Variance</Typography>
                      <Typography variant="h5">{numeral(form.total - currentTotal).format("0,0.00")}</Typography>
                    </Box>
                  </Grid>
                </CardContent>
              </Card>
              <Box sx={{textAlign:"right",py:2}}>
                <Button variant="text">Discard</Button>
                <Button variant="contained" onClick={saveTransaction}>Complete</Button>
              </Box>
          </Grid>
        </Grid>
    </>



}

export default NewBatchRecords