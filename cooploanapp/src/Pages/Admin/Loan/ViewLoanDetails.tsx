import { AccountBalance, AttachMoney, VolunteerActivism } from "@mui/icons-material"
import {  CardContent, Grid2 as Grid, Paper, Skeleton, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import { getByLoanId, LOAN } from "../../../repositories/loan"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { FormattedAmount } from "../../../components/NumberInput"



const LoadingFallback = ()=> {


  


  return <Grid container>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <AccountBalance sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
                <Skeleton />
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Outstanding Balance
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ pt: 3, p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <VolunteerActivism sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
                <Skeleton /> 

              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Last Payment : <Skeleton variant="text" /> 
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ pt: 3, p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <VolunteerActivism sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
              <Skeleton />
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  Last Payment : <Skeleton variant="text" />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
  </Grid>
}

const ViewLoanDetails = () => {
  const {loanid} = useParams()
  const { data: loan, isLoading: loading } = useQuery({ queryKey: [LOAN,{loanId: loanid}], queryFn: () => getByLoanId(loanid!), enabled:!!loanid })
  const [summary, setSummary] = useState({balance:0,interest:0, payments:0})
  useEffect(()=>{
    if(!loan) return
    let payments = loan.payment.reduce((p,c)=>{p + c.amount},0)
    let interest = loan.interests
    let balance = loan.principal + loan.interests - payments
    setSummary({balance, interest, payments})
},[loan])

  if(!loanid || loanid=="new") return <></>

  return loading ? <LoadingFallback /> : <Grid container>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <AccountBalance sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
                {FormattedAmount(summary.balance)}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Outstanding Balance
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ pt: 3, p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <VolunteerActivism sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
                {FormattedAmount(summary.payments)  }
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Last Payment : Sept 24,2024
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
    <Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ pt: 3, p: 2 }}>
      <Paper>
        <CardContent>
          <Grid container>
            <Grid size={2}>
              <AttachMoney sx={{ fontSize: '3rem', alignSelf: 'center' }} />
            </Grid>
            <Grid size={10} sx={{ textAlign: 'center', pr: 3 }}>
              <Typography gutterBottom variant="h5" component="div">
                {FormattedAmount(loan.principal + summary.interest)}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Total Interest : {FormattedAmount(summary.interest)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Paper>
    </Grid>
  </Grid>
}

export default ViewLoanDetails
