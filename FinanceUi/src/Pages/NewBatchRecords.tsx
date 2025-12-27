import { Add, GppBad, Receipt } from "@mui/icons-material"
import { AppBar, Box, Button, ButtonGroup, Card, CardContent, Grid2 as Grid, Stack, TextField, Toolbar, Typography } from "@mui/material"
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers"
import moment from "moment"
import { useRef, useState } from "react"
import {v7 as uuid} from 'uuid'
import NumberInput from "../common/NumberInput"
import Records from "./Records"
import SelectAccount from "../components/NewComponents/SelectAccount"


const BatchLineItem = ()=>{
  
    return <Box sx={{p:1}}>
      <Card elevation={0} sx={{backgroundColor:"#f9f9f9"}}>
        <CardContent>
          <Grid container>
            <Grid size={6} sx={{p:1}}>
              <TextField size="small" label="Product / Description" fullWidth multiline rows={4}/>
            </Grid>
            <Grid size={6}>
              <Stack>
                <Box  sx={{p:1}}>
                  <Button variant="text" fullWidth sx={{
                        justifyContent: 'space-between', borderColor: 'grey.200'}}>
                    {form.account?.name || 'Category'}
                    <Box sx={{ opacity: 0.3, display: 'flex' }}><Add /></Box>
                  </Button>
                </Box>
                <Box >
                  <NumberInput size="small" variant="outlined" fullWidth/>
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
      total:0
    })
    const [selectorConfig, setSelectorConfig] = useState({
      value:null,
      type:"account",
      onChange:()=>{},
      show: false
    })


    return <>
        
        <SelectAccount {...selectorConfig} />
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
                          onChange:(value)=>setForm({...form, account:value, accountId:value.id}),
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
                    <Button variant="outlined" fullWidth sx={{
                          justifyContent: 'space-between', borderColor: 'grey.200'}}>
                      {form.account?.name || 'Choose'}
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
                    sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'primary.main' }}
                  >
                    + Import from History
                  </Button>
                </Box>
                <ButtonGroup fullWidth sx={{mt:2}}>
                  <Button variant="outlined" fullWidth> <Add /> Add line item</Button>    
                  <Button variant="outlined" sx={{width:"15rem"}}> <GppBad /> Add Refunded Item</Button>    
                </ButtonGroup>               
              </Stack>
          </Grid>
        </Grid>
    </>



}

export default NewBatchRecords