import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, TextField } from "@mui/material"
import { useQuery } from "@tanstack/react-query";
import {LedgerAccount, User} from "FinanceApi";
import moment from "moment";
import {useEffect, useState } from "react";
import { USER, getAll } from "../../../repositories/users";
import NumberInput from "../../../components/NumberInput";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutatePayment } from "../../../repositories/payment";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePickerWithBlur from "../../../components/DatePickerWithBlur";
import {getAllLedgerAccts, LEDGER_ACCT} from "../../../repositories/ledgerAcct";
import NewAccount from "../Journal/NewAccount";
import { enqueueSnackbar } from "notistack";

interface CreatePaymentFormState {
  user : User | null,
  destinationAcct: LedgerAccount | null,
  date: moment.Moment,
  amount:number,
  method: string
}

const CreatePayment = () => {
  const { data: users, isLoading: userLoading } = useQuery<User[]>({ queryKey: [USER], queryFn: () => getAll() })
  const {data:accts, isLoading} = useQuery({queryKey:[LEDGER_ACCT], queryFn:()=>getAllLedgerAccts()})

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showNewLedgerAcct, setShowNewLedgerAcct] = useState(false);
  const [form, setForm] = useState<CreatePaymentFormState>({
    user: null,
    destinationAcct: null,
    date: moment(),
    amount: 0,
    method: "Cash"
  })
  const {create } = useMutatePayment()
  useEffect(() => {
    const data = {...form}
    if(!!searchParams.get("clientId") && !!users){
      data.user = users.find(e=>e.id==searchParams.get("clientId")) || null
    }
    if(!!searchParams.get("amount")){
      data.amount = Number(searchParams.get("amount"))
    }
    setForm(data)
  }, [users]);

  const doCreate = ()=>{
      if(!form.amount || !form.user || !form.destinationAcct) {
        enqueueSnackbar("Please fill up the required fields", {variant:"error"})
        return
      }
    
    
      const item ={
        appId:window.webConfig.app,
        userId: form.user!.id,
        date:form.date.format("YYYY-MM-DD"),
        amount:form.amount,
        method:form.method,
        DestinationAcctId: form.destinationAcct!.ledgerAcctId
      }
      create.mutateAsync(item).then(e=>{
        navigate(-1)
      })
  }

  return <Dialog open={true} maxWidth="sm" fullWidth onClose={()=>navigate(-1)}>
    <DialogTitle>Receive a payment</DialogTitle>
    <DialogContent>

      <Grid container>
        <Grid size={12} sx={{p:1}}>
        <DatePickerWithBlur label="Date" value={form.date}
                onChange={newValue => setForm({...form, date:newValue!})}
                slots={{
                    textField: (params) => (
                        <TextField
                          fullWidth

                            {...params}
                        />)
                }} />
        </Grid>
        <Grid size={12} sx={{ p: 1 }}>
          <Autocomplete
            value={form.user}
            onChange={(_event, newValue) => {
              setForm({ ...form, user: newValue! });
            }}
            getOptionKey={e => e.id}
            getOptionLabel={e => e?.name || ""}

            loading={userLoading}
            fullWidth
            options={users || []}
            renderInput={(params) => <TextField {...params} label="Client" />}
            renderOption={(props, option : User) => {
              const { key, ...optionProps } = props;
              return (
                <Box
                  key={key}
                  component="li"
                  {...optionProps}
                >
                  <Box>{option.name}</Box>
                  <Chip label={option.mobileNumber}></Chip>
                </Box>
              );
            }}
          />

        </Grid>
        <Grid size={12} sx={{ p: 1 }}>
            <NumberInput label="Amount" value={form.amount} onChange={(value:number)=> setForm({...form,amount:value})} /> 

        </Grid>
        <Grid size={12} sx={{ p: 1 }}>
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
              loading={ userLoading  }
              fullWidth
              options={ [...(accts || []),{createNew:true, name:"Add New Account",ledgerAcctId:"new", section: "assets"}].filter(e=>e.section=="assets")  }
              renderInput={(params ) => <TextField {...params}
                  // helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                                                   label="Receiver Account" />}
          />

        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={doCreate}>Submit</Button>
    </DialogActions>
    <NewAccount open={showNewLedgerAcct} onCancel={()=>setShowNewLedgerAcct(false)} onCreate={(value)=>{ setForm({...form,destinationAcct:value})}}><Box></Box></NewAccount>
    
  </Dialog>
}

export default CreatePayment