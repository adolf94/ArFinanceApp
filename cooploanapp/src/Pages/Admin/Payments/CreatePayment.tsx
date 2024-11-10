import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, TextField } from "@mui/material"
import { useQuery } from "@tanstack/react-query";
import { User } from "FinanceApi";
import moment from "moment";
import {useEffect, useState } from "react";
import { USER, getAll } from "../../../repositories/users";
import NumberInput from "../../../components/NumberInput";
import { DatePicker } from "@mui/x-date-pickers";
import { useMutatePayment } from "../../../repositories/payment";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePickerWithBlur from "../../../components/DatePickerWithBlur";



const CreatePayment = () => {
  const { data: users, isLoading: userLoading } = useQuery<User>({ queryKey: [USER], queryFn: () => getAll() })
const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({
    user: null,
    date: moment(),
    amount: 0,
    method: "Cash"
  })
  const {create } = useMutatePayment()
  useEffect(() => {
    const data = {...form}
    if(!!searchParams.get("clientId") && !!users){
      data.user = users.find(e=>e.id==searchParams.get("clientId"))
    }
    if(!!searchParams.get("amount")){
      data.amount = Number(searchParams.get("amount"))
    }
    setForm(data)
  }, [users]);

  const doCreate = ()=>{
      const item ={
        appId:'loans',
        userId: form.user!.id,
        date:form.date.format("YYYY-MM-DD"),
        amount:form.amount,
        method:form.method
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
            renderOption={(props, option) => {
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
            <NumberInput label="Amount" value={form.amount} onChange={value=> setForm({...form,amount:value})} /> 

        </Grid>
      </Grid>
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={doCreate}>Submit</Button>
    </DialogActions>
  </Dialog>
}

export default CreatePayment