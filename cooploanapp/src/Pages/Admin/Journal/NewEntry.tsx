import {DialogTitle, Dialog, Typography,  DialogContent, Grid2 as Grid, ButtonGroup, Button, Autocomplete, Box, TextField, IconButton, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {getAllLedgerAccts, LEDGER_ACCT} from "../../../repositories/ledgerAcct";
import { useQuery } from "@tanstack/react-query";
import {LedgerAccount} from "FinanceApi";
import NewAccount from "./NewAccount";
import NumberInput from "../../../components/NumberInput";
import {useMutateLedgerEntry} from "../../../repositories/ledgerEntries";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers";
import { Close } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";


interface NewEntryState {
    date: string,
    creditAcct: LedgerAccount | null,
    creditId: string,
    debitAcct: LedgerAccount | null,
    debitId: string,
    amount:number,
    description:string
}


const typeData = [
    {type:"Transfer", creditFilter:["assets","receivables"], debitFilter:["assets","receivables"] , creditName: "From", debitName: "To"},
    {type:"Expense", creditFilter:["assets","receivables"], debitFilter:["expense"] , creditName: "Account Source", debitName: "Expense"},
    {type:"Income", creditFilter:["income"], debitFilter: ["assets","receivables"], creditName: "Income", debitName: "Account Destination"},
    
    
]

const defaultFormValue = {
    creditAcct: null ,
    creditId: "",
    debitAcct: null,
    debitId:"",
    amount:0,
    description:"",
    date:moment().format("YYYY-MM-DD")
}
const NewEntry = ({children} : {children:any})=>{
    
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const {data:accts, isLoading} = useQuery({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})
    const [showNewLedgerAcct, setShowNewLedgerAcct] = useState("")
    const [type, setType] = useState({type:"Transfer", creditFilter:["assets","receivables"], debitFilter:["assets","receivables"] , creditName: "From", debitName: "To"})
    const [form,setForm] = useState<NewEntryState>(defaultFormValue)
    const {create} = useMutateLedgerEntry()
    
    const onClose = () => {
        setOpen(false)
    }
    
    
    const onSave = ()=>{
        
        if(!form.creditAcct || !form.debitAcct){
            enqueueSnackbar("Fill out the required Credit and Debit data", {variant:'error'})
            return;
        }
        if(!form.amount || !form.description){
            enqueueSnackbar("Fill out the required Description and Amount", {variant: 'error'})
            return;
        }
        
        let {date, description, amount, debitId,creditId} = form
        create.mutateAsync({
            date, description, amount, debitId,creditId
        }).then(()=>{
            enqueueSnackbar("Entry added successfully", {variant:"success"})
            setForm(defaultFormValue)
            setOpen(false)
        })
        
        
        
        
    }
    
    
    
    
    return <>
        { React.cloneElement( children, { onClick: ()=>setOpen(true) } ) }

        <Dialog open={!!open} fullScreen={fullScreen} onClose={onClose}>
            <DialogTitle>
                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                    <Typography variant="body1">Add Entry</Typography>
                    <Box>
                        <IconButton  onClick={()=>navigate(-1)}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>
                
            </DialogTitle>
            <DialogContent>
                
                <Grid container margin={2}>
                    <Grid container size={12} sx={{justifyContent:'center'}}>
                        <ButtonGroup variant={"contained"}>
                            {typeData.map(e=> <Button 
                                variant={type.type==e.type?"outlined":"contained"}
                                onClick={()=>setType(e)}
                            >{e.type}</Button>)}
                           
                        </ButtonGroup>
                    </Grid>
                </Grid>
                <Box>
                <Grid container>
                    <Grid container sx={{p:1}} size={{xs:12,md:6}} >
                        <Grid size={12} >
                            <DatePicker label="Date"
                                        value={moment(form.date)}
                                        defaultValue={moment().hours(0).minutes(0).second(0)}
                                        onChange={(date : moment.Moment | null)=>setForm({...form,date:date!.format("YYYY-MM-DD")})}
                                        slots={{
                                            textField: (params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                />)
                                        }}/>
                        </Grid>
                        {["Expense","Transfer"].includes(type.type) && <Grid size={12} sx={{my:1}}>

                          <Autocomplete
                            value={form.creditAcct}
                            onChange={(_event, outValue ) => {
                                let  newValue = outValue as  LedgerAccount  & {createNew:boolean}

                                if(!!newValue?.createNew){
                                    setForm({ ...form, creditAcct: form.creditAcct||null, creditId:""});
                                    setShowNewLedgerAcct("credit")
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
                            options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: type.creditFilter[0]}].filter(e=>type.creditFilter.includes(e.section))  }
                            renderInput={(params ) => <TextField {...params} fullWidth
                                // helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                                                                 label={type.creditName} />}
                          />
                        </Grid>}
                        <Grid  size={12} sx={{my:1}}>

                            <Autocomplete
                                value={form.debitAcct}
                                onChange={(_event, outValue ) => {
                                    let  newValue = outValue as  LedgerAccount  & {createNew:boolean}

                                    if(!!newValue?.createNew){
                                        setForm({ ...form, debitAcct: form.debitAcct||null, debitId:""});
                                        setShowNewLedgerAcct("debit")
                                        return
                                    }
                                    setForm({ ...form, debitAcct: newValue, debitId:newValue.ledgerAcctId});
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
                                options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: type.debitFilter[0]}].filter(e=>type.debitFilter.includes(e.section))  }
                                renderInput={(params ) => <TextField {...params}
                                    // helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                                                                     label={type.debitName} />}
                            />
                        </Grid>
                        {["Income"].includes(type.type) &&  <Grid   size={12} sx={{my:1}}>

                          <Autocomplete
                            value={form.creditAcct}
                            onChange={(_event, outValue ) => {
                                let  newValue = outValue as  LedgerAccount  & {createNew:boolean}

                                if(!!newValue?.createNew){
                                    setForm({ ...form, creditAcct: form.creditAcct||null, creditId:""});
                                    setShowNewLedgerAcct("credit")

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
                            options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: type.creditFilter[0]}].filter(e=>type.creditFilter.includes(e.section))  }
                            renderInput={(params ) => <TextField {...params}
                                // helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                                                                 label={type.creditName} />}
                          />
                        </Grid>}
                    </Grid>
                    <Grid container sx={{p:1}} size={{xs:12,md:6}}>

                        <Grid size={12}> 

                            <NumberInput label="Amount" value={form.amount} onChange={(value:number)=> setForm({...form,amount:value})} />
                        </Grid>
                        <Grid size={12} sx={{my:2}}>
                            <TextField multiline value={form.description} rows={3} fullWidth placeholder="Description"
                                       onChange={(evt)=>setForm({...form, description:evt.target.value})} />
                        </Grid>
                        <Grid size={12} sx={{my:2}}>
                            <Button variant="contained" fullWidth
                                onClick={onSave} disabled={create.isPending}
                            >Submit</Button>
                        </Grid>
                        
                    </Grid>
                </Grid>
                </Box>
                
            </DialogContent>
        </Dialog>
        <NewAccount open={!!showNewLedgerAcct} onCancel={()=>setShowNewLedgerAcct("")} onCreate={(value)=>{ setForm({...form,[`${showNewLedgerAcct}Acct`]:value,[`${showNewLedgerAcct}Id`]:value.ledgerAcctId})}}><Box></Box></NewAccount>

    </>
}


export default NewEntry