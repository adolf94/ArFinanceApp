import {Box, Button, Grid2 as Grid, Paper, Tab, Tabs} from "@mui/material"
import React,{Dispatch, SetStateAction, useContext, useEffect, useState} from "react"
import {createSearchParams, Navigate, Route, Routes, useMatch, useNavigate} from "react-router-dom"
import LoansTable from "./LoansTable"
import ViewLoanDetails from "./ViewLoanDetails"
import SettingsIndex from "../Settings/Index"
import UserPanel from "../User/UserPanel"
import Journal from "../Journal/Journal";
import JournalEntries from "../Journal/Entries";
import SmallTab from "./TabExtension";


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

export const pages = [
  {value:'loan', label:'Loans'},
  {value:'user', label:'Users / Clients'},
  {value:'journal', label:'Journal'},
  {value:'settings', label:'Settings'},
]

const AdminBody = () => {
  const navigate = useNavigate()
  const match = useMatch("/admin/:tab/*")
  const [page,setPage] = useState(pages.find(e=>e.value==(match?.params?.tab || "loan")))
  
  const [payCtx,setPayCtx] = useState(selectPaymentContextDefaultValue.payCtx)

  useEffect(() => {
    setPage(pages.find(e=>e.value==(match?.params?.tab || "loan")))
  }, [match?.params?.tab]);
  
  
  return <Box sx={{width:'100%'}}>
    <SelectPaymentContext.Provider value={{payCtx, setPayCtx}}>
      <Grid container>
        <Grid size={{sm:12,lg:6}} sx={{pb:2}}>
          <Paper sx={{p:1}}>
            <Grid container>
              <Grid size={12} container sx={{ justifyContent:'space-between'}}>
                <Box sx={{display:{xs:"none", sm:'flex'}}}>
                  <Tabs 
                    value={page?.value}
                    onChange={(_, value)=>navigate(`../admin/${value}`)}
                    textColor="secondary"
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                  >
                    {pages.map(e=><Tab value={e.value} key={e.value} label={e.label} />)}
                  </Tabs>
                </Box>
                <Box sx={{display:{xs:"flex", sm:'none'}}}>
                  <SmallTab value={page} onChange={(value)=>navigate(`../admin/${value.value}`)} />
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
                    <Route path="/journal/*" element={ <Journal  /> }></Route>
                    <Route path="/user/*" element={ <UserPanel /> }></Route>
                    <Route path="*" element={ <Navigate to="../loan" /> }></Route>
                  </Routes>
                
              </Grid>
            </Grid>s
          </Paper>
        </Grid>
        <Grid size={{sm:12,lg:6}}>
          <Routes>
            <Route path="/loan/:loanid" element={ <ViewLoanDetails />}></Route>
            <Route path="/journal/*" element={ <JournalEntries />}></Route>
          </Routes>
        </Grid>
      </Grid>
    </SelectPaymentContext.Provider>
  </Box>
}

export default AdminBody