import { Tabs, Tab, Grid2 as Grid, Box, Paper, TableContainer, TableHead, Table, TableRow, TableCell } from "@mui/material"
import { useEffect } from "react"
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate, useParams } from "react-router-dom"
import LoansTable from "./LoansTable"
import ViewLoanDetails from "./ViewLoanDetails"
import SettingsIndex from "../Settings/Index"
import UserPanel from "../User/UserPanel"



const AdminBody = () => {
  const navigate = useNavigate()
  const match = useMatch("/admin/:tab/*")

  return <Box sx={{width:'100%'}}>
    <Grid container>
      <Grid size={{sm:12,lg:6}}>
        <Paper sx={{p:1}}>
          <Grid container>
            <Grid size={12}>
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
            </Grid>
            <Grid container size={12}> 
                <Routes>
                  <Route path="/loan/*" element={ <LoansTable /> }></Route>
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
  </Box>
}

export default AdminBody