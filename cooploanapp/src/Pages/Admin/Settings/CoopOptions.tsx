import { Card, Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid2 as Grid, Grid2, TextField, CardActions, Button, Alert } from "@mui/material"
import moment from "moment"
import { useEffect, useState } from "react"
import NumberInput from "../../../components/NumberInput"
import { DatePicker } from "@mui/x-date-pickers";
import { useQuery } from "@tanstack/react-query";
import { COOP_OPTION, getOptionByYear, useMutateCoopOption } from "../../../repositories/coopOption";
import cron from 'cron-parser'

const years = (()=>{
  let initial = 2023
  let items = []
  while(initial <= moment().add(1,'year').year()){
    items.push(initial)
    initial++
  }
  return items
})()

const count = (()=>{
  let initial = 1
  let items = []
  while(initial <= 60){
    items.push(initial)
    initial++
  }
  return items
})()

const cronOptions = [
  { name: "Monthly", cron: "0 0 DD * *", count:12 },
  { name: "Twice a month 15/30", cron: "0 0 15,[L] * *", count: 24 },
   { name: "Weekly (Friday)", cron: "0 0 0 * * 5", count:52}
];

interface CoopOptionProps {

}

const CoopOption = ()=>{

    const [year,setYear] = useState(moment().year())

    const [form, setForm] = useState({
      initialAmount: 0,
      firstInstallment: moment().set('year',year).set( 'month',0).set('date',15) ,
      increments: 0,
      installmentCount:12,
      frequency: { name: "Monthly", cron: "0 0 DD * *", count:12 }
    })
    const {data: option, status, isSuccess, isLoading, isError,refetch} = useQuery({
      queryKey: [COOP_OPTION,{year:year}],
       queryFn:()=>getOptionByYear(year),
       retry:false,
       gcTime: 24*60*60*1000
    })
    const {create} = useMutateCoopOption()
    useEffect(()=>{
      if(isSuccess && !!option){
        setForm({
          ...option,
          year,
          firstInstallment: moment(option.firstInstallment)
        })
      }
    },[option,isSuccess])
    

    const save = ()=>{


      create.mutateAsync({
        ...form, 
        year,
        firstInstallment: form.firstInstallment.format("YYYY-MM-DD")
      }).then(()=>refetch())

    }


    return <Card variant="outlined"  sx={{ p: 1 }}>
      <Box display="flex" justifyContent="space-between" sx={{pb:2}}>
        <Typography gutterBottom variant="h6" component="div">
          Coop Options
        </Typography>
        <Box>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Year</InputLabel>
            <Select
              value={year}
              label="Year"
              size="small"
              onChange={(evt)=>setYear(Number.parseInt(evt.target.value.toString()))}
            >
              {years.map(e=><MenuItem value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* //@ts-ignore */}
      {isError ? <Box sx={{pb:1}}>
        <Alert color="error">No data is available for  {year}. Please set it up</Alert>
      </Box> : null }
      <Box sx={{pb:2}}>
        {status}
        <NumberInput label="Amount per head/stock contribution" value={form.initialAmount} onChange={e=>setForm({...form, initialAmount:e})} />
      </Box>
      <Box sx={{pb:2}}>
        <NumberInput label="Increment per installment" helperText="Default is 0, Dont change this for COOP"
        value={form.increments} onChange={e=>setForm({...form, increments:e})} />
      </Box>
      <Grid2 container sx={{pb:2}}>
        <Grid size={6} sx={{pr:1}}>
          <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Frequency</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={form.frequency?.cron || ""}
                label="Frequency"
                onChange={(evt)=>{
                  let newValue = cronOptions.find(e=>evt.target.value == e.cron)
                  setForm({...form, frequency:newValue!, installmentCount: newValue?.count || form.installmentCount })
                }}
              >
                {cronOptions.map(e=><MenuItem value={e.cron}>{e.name}</MenuItem>)}
              </Select>
            </FormControl>
        </Grid>
        <Grid size={6} sx={{pl:1, pb:2}}>
          <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label" sx={{background:'white'}}>No. Of Installments/Contribution</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={form.installmentCount}
                label="Year"
                onChange={(evt)=>setForm({...form, installmentCount:Number.parseInt(evt.target.value.toString())})}
              >
                {count.map(e=><MenuItem value={e}>{e}</MenuItem>)}
              </Select>
            </FormControl>
        </Grid>
        <Grid  size={12}>
          
          <DatePicker label="First Installment" value={form.firstInstallment} 
                onAccept={newValue => setForm({...form, firstInstallment:newValue!})}
                slots={{
                    textField: (params) => (
                        <TextField
                        fullWidth
                            {...params}
                        />)
                }} />
        </Grid>
      </Grid2>
      <CardActions sx={{justifyContent:"end"}}>
        <Button variant="outlined" onClick={save} disabled={isLoading || create.isPending}>Save</Button>
      </CardActions>
    </Card>
}



export default CoopOption