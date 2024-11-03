import { Box, CardContent, FormControl, Grid2 as Grid, IconButton, InputLabel, MenuItem, Paper, Select,
  Table,
  TableCell,
  TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import AuthenticatedLayout from "../../components/AuthenticatedLayout"
import {  TableChart, TableView } from "@mui/icons-material"
import moment from "moment"
import { useEffect, useState } from "react"
import {  useQuery } from "@tanstack/react-query"
import { getMemberProfile,  MEMBER_PROFILE } from "../../repositories/memberProfile"
import useUserInfo from "../../components/userContext"
import { PieChart } from '@mui/x-charts/PieChart';
import { Contribution, MemberProfile } from "../../@types/FinanceApi/memberProfile"
import numeral from "numeral"
import CoBorrowerView from "./CoBorrowers"
import {Route, Routes } from "react-router-dom"
import ViewLoanDialog from "./ViewLoanDialog";
const years = (() => {
  let initial = 2023
  let items = []
  while (initial <= moment().add(1, 'year').year()) {
    items.push(initial)
    initial++
  }
  return items
})()


const startAngle = -90
const MemberP = () => {
  const [year, setYear] = useState<number>(moment().year())
  const { user } = useUserInfo()
  console.log(user)
  const { data: memberProfile } = useQuery<MemberProfile>({ queryKey: [MEMBER_PROFILE, { userId: user.userId!, year }], queryFn: () => getMemberProfile(user.userId!, year) })

  const [data, setData] = useState({
    total: 0,
    count: 0,
    remaining: 0,
    overall: 0,
    remainingAmount: 0,
    endAngle: startAngle
  })


  useEffect(() => {
    if (!memberProfile) return
    let dita = {
      total: memberProfile.contributions.reduce((p: number, c: Contribution) => p + c.amount, 0),
      overall: (memberProfile.initialAmount * memberProfile.installmentCount) + (((memberProfile.installmentCount - 1) * (memberProfile.installmentCount)) / 2 * memberProfile.increments!),
      count: memberProfile.contributions.length,
      remaining: memberProfile.installmentCount - memberProfile.contributions.length,
      remainingAmount: 0,
      endAngle: (memberProfile.contributions.length / memberProfile.installmentCount * 360) + startAngle
    }

    dita.remainingAmount = dita.overall - dita.total

    setData(dita)
  }, [memberProfile])



  return <Box sx={{ width: '100vw' }} >
    <Grid container size={12}>
      <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ p: 2 }}>
        <Paper>
          <CardContent>
            <Grid container>
              <Typography variant="h6">My Contributions</Typography>
            </Grid>
            <Grid container justifyContent="space-between"> 
              <Typography>Total Count: {data.count} / {memberProfile?.installmentCount} </Typography>
              <Typography>Total Amount: {numeral(data.total).format("0,0")} / {numeral(data.overall).format("0,0")} </Typography>
            </Grid>
            <Grid container justifyContent='center' paddingTop={2}>
              <PieChart
                series={[
                  {
                    data: [
                      { id: 0, value: data.total, label: 'Contributions', color: 'lightgreen' },
                      { id: 1, value: data.remainingAmount, label: 'Remaining', color: '#eaecf0' }
                    ],
                    startAngle: startAngle,
                    innerRadius: 40
                  },
                ]}
                width={400}
                height={200}
              />

            </Grid>
          </CardContent>
        </Paper>
      </Grid>
      <Grid size={{ lg: 8, sm: 6, xs: 12 }} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent:'end' }}>
          <Box>
            <IconButton><TableView /></IconButton>
            <IconButton><TableChart /></IconButton>
          </Box>
          <Box>
            <FormControl >
              <InputLabel id="demo-simple-select-label">Year</InputLabel>
              <Select
                value={year}
                label="Year"
                size="small"
                onChange={(evt) => setYear(Number.parseInt(evt.target.value.toString()))}
              >
                {years.map(e => <MenuItem value={e}>{e}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <CoBorrowerView  year={year}/>
      </Grid>
    </Grid>
    
    <Routes>
      <Route path="/loan/:loanid" element={<ViewLoanDialog />}></Route>
    </Routes>
  </Box>
}


const MemberPage = () => {
  return <AuthenticatedLayout persona="member">
    <MemberP />
  </AuthenticatedLayout>
}


export default MemberPage