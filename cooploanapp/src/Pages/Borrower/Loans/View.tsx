import { Dialog, DialogContent, Grid2 as Grid, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { getByLoanId, LOAN } from "../../../repositories/loan"
import { useEffect, useState } from "react"
import moment from "moment"
import BackdropLoader from "../../../components/BackdropLoader"
import { FormattedAmount } from "../../../components/NumberInput"
import LoanModeler from "../../Admin/LoanModeler"
import {generateCompute} from "../../../components/useComputeInterest";
import {LoanInterest, LoanPayment} from "FinanceApi";



interface ViewLoanAsBorrowerProps {

}

const ViewLoanAsBorrower = (props: ViewLoanAsBorrowerProps) => {

  const {loanId} = useParams()
  const { data: loan, isLoading: loading } = useQuery({ queryKey: [LOAN,{loanId: loanId}], queryFn: () => getByLoanId(loanId!) })
  const [summary, setSummary] = useState({balance:0,interest:0, payments:0})
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()
  useEffect(()=>{
    if(!loan) return
    let payments = loan.payment.reduce((p: number,c:LoanPayment)=>{return p + c.amount},0)
    let principal = loan.payment.reduce((p: number,c:LoanPayment)=>{return  p - (c.againstPrincipal? c.amount: 0)},loan.principal)
    
    
    
    
    let interest = loan.interestRecords.reduce((p: number,c:LoanInterest)=>{return p + c.amount},0)
    let balance = loan.principal + interest - payments

  if(loan.loanProfile.computePerDay) {
    const computeInterest = generateCompute(loan, loan.loanProfile)

    let interestOut = computeInterest(moment(), {
      date: moment(),
      balance: balance,
      totalInterestPercent:loan.totalInterestPercent,
      interest:interest,
      principal:principal
    })
    
    balance = balance  - interestOut.amount;
    interest = interest - interestOut.amount
  }

    
    setSummary({balance , interest, payments})
  
      
    const p = loan.payment?.reduce((p,c)=>{
      let index = p.findIndex(e=>e.paymentId == c.paymentId)
      let key = c.againstPrincipal?'principal':'interest'
      c.strDate = c.date
      c.date = moment(c.date)
      if(index === -1){
        p.push({...c, type:'payment', sub:{[key]:c} })
      }else{
        p[index].amount = p[index].amount + c.amount;
        p[index].sub[key] = c
      }
      return p;
    },[])
        .sort((a,b)=>a.strDate==b.strDate?0: a.strDate>b.strDate?1:-1)
  
        setPayments(p)
  
    },[loan])


  return !!loading  ?  <BackdropLoader /> 
    :<Dialog open maxWidth="lg" fullWidth onClose={()=>navigate("../")}>
      <DialogContent>
        <Grid container>
          <Grid container size={4}>
            <Grid container size={12} sx={{display:'flex'}}>
              <Grid size={4}>
                <Typography variant="body2" sx={{fontWeight:'bold'}}>Date Start:</Typography>
              </Grid>
              <Grid>
                <Typography variant="body2">{moment(loan.date).format("MMM DD,YYYY")}</Typography>
              </Grid>
            </Grid>
            <Grid container size={12} sx={{display:'flex'}}>
              <Grid size={4}>
                <Typography variant="body2" sx={{fontWeight:'bold'}}>Principal:</Typography>
              </Grid>
              <Grid>
                <Typography variant="body2">{FormattedAmount(loan.principal)}</Typography>
              </Grid>
            </Grid>
            <Grid container size={12} sx={{display:'flex'}}>
              <Grid size={4}>
                <Typography variant="body2" sx={{fontWeight:'bold'}}>Interests:</Typography>
              </Grid>
              <Grid>
                <Typography variant="body2">{FormattedAmount(summary.interest)}</Typography>
              </Grid>
            </Grid>
            <Grid container size={12} sx={{display:'flex'}}>
              <Grid size={4}>
                <Typography variant="body2" sx={{fontWeight:'bold'}}>Payments:</Typography>
              </Grid>
              <Grid>
                <Typography variant="body2">{FormattedAmount(summary.payments)}</Typography>
              </Grid>
            </Grid>
            <Grid container size={12} sx={{display:'flex'}}>
              <Grid size={4}>
                <Typography variant="body2" sx={{fontWeight:'bold'}}>Balance:</Typography>
              </Grid>
              <Grid>
                <Typography variant="body2">{FormattedAmount(summary.balance)}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={8}>
          <LoanModeler addCurrentDate loanProfile={loan.loanProfile!} payments={payments} expectedPayments={loan.expectedPayments}
                       loanInfo={{date:moment(loan.date), readonly:true, principal:loan.principal}} />
          {/* //onChange={(data)=>setForm({...form,date:data.date, amount:data.principal})}  onPaymentsChange={(data)=>setPaymentData(data)} /> */}

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog> 
  

} 

export default ViewLoanAsBorrower