import { AccountBalance, AttachMoney, VolunteerActivism } from "@mui/icons-material"
import {  CardContent, Chip, Grid2 as Grid, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import { getByLoanId, LOAN } from "../../../repositories/loan"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { FormattedAmount } from "../../../components/NumberInput"
import moment from "moment"
import React from "react"
import {generateCompute} from "../../../components/useComputeInterest";
import {LoanInterest, LoanPayment} from "FinanceApi";



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
  const { data: loan, isLoading: loading } = useQuery({ queryKey: [LOAN,{loanId: loanid}], queryFn: () => getByLoanId(loanid!), enabled:!!loanid && loanid != 'new'})
  const [summary, setSummary] = useState({balance:0,interest:0, payments:0})
  const [transactions, setTransactions] = useState<any[]>([])
  useEffect(()=>{
    if(!loan) return
    let payments = loan.payment.reduce((p,c)=>{return p + c.amount},0)
    let principal = loan.payment.reduce((p: number,c:LoanPayment)=>{return  p - (c.againstPrincipal? c.amount: 0)},loan.principal)
    let interest = loan.interestRecords.reduce((p,c)=>{return p + c.amount},0)
    let balanceAmount = loan.principal + interest - payments

    const balance = {
      total : loan.principal,
      interest : 0,
      principal: loan.principal
    }

    let interestItems = loan.interestRecords.map(e=>({...e,date:e.dateStart,type:'interest'}))
    
    if(loan.loanProfile.computePerDay){
      const computeInterest = generateCompute(loan, loan.loanProfile)

      let interestOut = computeInterest(moment(), {
        date: moment(),
        balance: balanceAmount,
        totalInterestPercent:loan.totalInterestPercent,
        interest:interest,
        principal:principal
      })

      balanceAmount = balanceAmount - interestOut.amount
      interest = interest - interestOut.amount



      interestItems.push(  {
        dateCreated: moment().format('YYYY-MM-DD'),
        dateStart: loan.lastInterest,
        dateEnd: moment().add(-1,'days'),
        amount: -interestOut.amount,
        type: "interest",
        totalPercentage: interestOut.totalInterestPercent
      })
    }
    
    setSummary({balance: balanceAmount, interest, payments})


    
    
    let paymentsItems = loan.payment.reduce((p,c)=>{
      let index = p.findIndex(e=>e.paymentId == c.paymentId)
      let key = c.againstPrincipal?'principal':'interest'

      if(index === -1){
        p.push({...c, type:'payment', sub:{[key]:c} })
      }else{
        p[index].amount = p[index].amount + c.amount;
        p[index].sub[key] = c
      }

      return p;
    },[])

    let records = [...paymentsItems, ...interestItems]
        .sort((a,b)=>a.date==b.date?0: a.date<b.date?1:-1)
        .map(e=>{
          let out = {...e,
            interestBalance : balance.interest,
            principalBalance : balance.principal,

            principalAmount : 0,
            interestAmount : 0,
            balance:balance.total


          }
          if(e.type=='interest'){
            balance.interest = balance.interest + e.amount;
            out.interestBalance = balance.interest;
            balance.total = balance.total + e.amount
            out.balance = balance.total;

            out.interestAmount = e.amount;

          }else{
            let currentAmount = e.amount;
            if(balance.interest > 0){
              if(balance.interest > e.amount){
                balance.interest = balance.interest - currentAmount;
                out.interestBalance = balance.interest;

                balance.total = balance.total - currentAmount;
                out.balance = balance.total;

                out.interestAmount = -currentAmount;
                currentAmount = 0;

              }else{

                balance.total = balance.total - balance.interest;
                out.balance = balance.total;

                out.interestAmount = -balance.interest;
                currentAmount = currentAmount - balance.interest;
                balance.interest = 0;
                out.interestBalance = balance.interest;


              }

            }

            if(currentAmount > 0){
              if(balance.principal > currentAmount){
                balance.principal = balance.principal - currentAmount;
                out.principalBalance = balance.principal;

                balance.total = balance.total - currentAmount;
                out.balance = balance.total;

                out.principalAmount = -currentAmount
                currentAmount = 0
              }else{
                balance.principal = 0;
                out.principalBalance = balance.principal;
                balance.total =  0;
                out.balance = balance.total;


                out.principalAmount = -balance.principal
                currentAmount = 0
              }
            }
            out.amount = -e.amount
          }


          return out
        })
    setTransactions(records)
    
  },[loan])


  if(!loanid || loanid == "new") return <></>

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
    <Grid size={12} sx={{ pt: 3, p: 2 }}>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell colSpan={2}>Amount</TableCell>
                <TableCell colSpan={2}>Balance</TableCell>
              </TableRow>
                  {/* <TableRow>
                      <TableCell></TableCell>
                      <TableCell sx={{textAlign:'center', fontSize:'small'}}>Interest</TableCell>
                      <TableCell sx={{textAlign:'center', fontSize:'small'}}>Principal</TableCell>
                      <TableCell sx={{textAlign:'center', fontSize:'small'}}>Interest</TableCell>
                      <TableCell sx={{textAlign:'center', fontSize:'small'}}>Principal</TableCell>
                  </TableRow> */}
            </TableHead>
            <TableBody>
                {transactions.map(item=><React.Fragment key={item.id}><TableRow sx={{backgroundColor:item.type=='interest'?'#ffbcbc':'unset'}}>
                      <TableCell>{moment(item.date).format("YYYY-MM-DD")}</TableCell>
                      <TableCell colSpan={2} sx={{textAlign:'center'}}>{FormattedAmount(item.amount)}</TableCell>
                      <TableCell colSpan={2} sx={{textAlign:'center'}}>{FormattedAmount(item.balance)}</TableCell>
                  </TableRow>
                  {/* <TableRow sx={{backgroundColor:item.type=='interest'?'#ffbcbc':'unset'}}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell sx={{textAlign:'center ', fontSize:'small'}}>
                        {item.interestAmount === 0 ? <Chip label="0.00" size="small"/> : 
                              item.interestAmount <0 ? <Chip label={FormattedAmount(item.interestAmount)} color='primary' /> : <Chip label={FormattedAmount(item.interestAmount)} color='error' />}
                        </TableCell>
                      <TableCell sx={{textAlign:'center', fontSize:'small'}}>
                        
                      {item.principalAmount === 0 ? <Chip label="0.00" size="small"/> : 
                              item.principalAmount < 0 ? <Chip label={FormattedAmount(item.principalAmount)} color='success' /> : <Chip label={FormattedAmount(item.principalAmount)} color='error' />}
                       </TableCell>
                      <TableCell sx={{textAlign:'right', fontSize:'small'}}>{FormattedAmount(item.interestBalance)}</TableCell>
                      <TableCell sx={{textAlign:'right', fontSize:'small'}}>{FormattedAmount(item.principalBalance)}</TableCell>
                  </TableRow> */}
                </React.Fragment>)}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Grid>
  </Grid>
}

export default ViewLoanDetails
