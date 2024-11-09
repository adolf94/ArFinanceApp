import {Box, Button, Grid2 as Grid, Paper, Tab, Tabs} from "@mui/material"
import React,{Dispatch, SetStateAction, useContext, useState} from "react"
import {createSearchParams, Route, Routes, useMatch, useNavigate} from "react-router-dom"
import LoansTable from "./LoansTable"
import ViewLoanDetails from "./ViewLoanDetails"
import SettingsIndex from "../Settings/Index"
import UserPanel from "../User/UserPanel"


const selectPaymentContextDefaultValue :{payCtx:any, setPayCtx: (value:any)=>any} = {
  payCtx : {
    userId:"",
    items:[]
  },
  setPayCtx: ()=>{} 
}
const SelectPaymentContext = React.createContext(selectPaymentContextDefaultValue)
SelectPaymentContext.displayName = "SelectPaymentContext"

export const usePaymentContext = ()=>{
  return useContext(SelectPaymentContext)
}

const AdminBody = () => {
  const navigate = useNavigate()
  const match = useMatch("/admin/:tab/*")
  const [payCtx,setPayCtx] = useState(selectPaymentContextDefaultValue.payCtx)
  
  
  return <Box sx={{width:'100%'}}>
    <SelectPaymentContext.Provider value={{payCtx, setPayCtx}}>
      <Grid container>
        <Grid size={{sm:12,lg:6}}>
          <Paper sx={{p:1}}>
            <Grid container>
              <Grid size={12} container sx={{ justifyContent:'space-between'}}>
                <Box>
                  <Tabs
                    value={match?.params?.tab || "user"}
                    onChange={(_, value)=>navigate(`../admin/${value}`)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                  >
                    <Tab value="loan" label="Loans"/>
                    <Tab value="user" label="Users / Clients" />
                    <Tab value="settings" label="Settings" />
                  </Tabs>
                </Box>
                <Box sx={{mt:1}}>
                  {
                    payCtx.items.length > 0 && <Button size="small" variant="contained"
                                                       onClick={()=>{
                                                         let amount = payCtx.items.reduce((p:number,c:any)=>p+c.balance,0)
                                                           navigate({
                                                             pathname: "../admin/payment/new",
                                                             search: createSearchParams({
                                                               clientId: payCtx.userId,
                                                               amount
                                                             }).toString()
                                                           })
                                                          setPayCtx(selectPaymentContextDefaultValue.payCtx) 
                                                       }}
                                                       color="success">Receive Payments</Button>
                  }
                </Box>
              </Grid>
              <Grid container size={12}> 
                  <Routes>
                    <Route path="/loan/*" element={ <LoansTable /> }></Route> 
                    <Route path="/payment/new" element={ <LoansTable /> }></Route>
                    <Route path="/settings/*" element={ <SettingsIndex /> }></Route>
                    <Route path="/user/*" element={ <UserPanel /> }></Route>
                  </Routes>
                
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{sm:12,lg:6}}>
          <Routes>
            <Route path="/loan/:loanid" element={ <ViewLoanDetails />}></Route>
          </Routes>
        </Grid>
      </Grid>
    </SelectPaymentContext.Provider>
  </Box>
}

export default AdminBody