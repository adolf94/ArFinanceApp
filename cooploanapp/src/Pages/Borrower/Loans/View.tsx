import { Dialog, DialogContent, Grid2 as Grid, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { getByLoanId, LOAN } from "../../../repositories/loan"
import { useEffect, useState } from "react"
import moment from "moment"
import BackdropLoader from "../../../components/BackdropLoader"
import { FormattedAmount } from "../../../components/NumberInput"
import LoanModeler from "../../Admin/LoanModeler"



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
    let payments = loan.payment.reduce((p,c)=>{return p + c.amount},0)
    let interest = loan.interestRecords.reduce((p,c)=>{return p + c.amount},0)
    let balance = loan.principal + interest - payments
    setSummary({balance, interest, payments})

    
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




  // const transactions = (()=>{
  //   if(!loan) return []
  //   const balance = {
  //     total : loan.principal,
  //     interest : 0,
  //     principal: loan.principal
  //   }

  //   let interest = loan.interestRecords.map(e=>({...e,date:e.dateStart,type:'interest'}))

  //   let records = [...payments, ...interest]
  //     .sort((a,b)=>a.date==b.date?0: a.date>b.date?1:-1)
  //     .map(e=>{
  //       let out = {...e,
  //         interestBalance : balance.interest,
  //         principalBalance : balance.principal,

  //         principalAmount : 0,
  //         interestAmount : 0,
  //         balance:balance.total


  //       }
  //       if(e.type=='interest'){
  //         balance.interest = balance.interest + e.amount;
  //         out.interestBalance = balance.interest;
  //         balance.total = balance.total + e.amount
  //         out.balance = balance.total;

  //         out.interestAmount = e.amount;

  //       }else{
  //         let currentAmount = e.amount;
  //         if(balance.interest > 0){
  //           if(balance.interest > e.amount){
  //             balance.interest = balance.interest - currentAmount;
  //             out.interestBalance = balance.interest;
              
  //             balance.total = balance.total - currentAmount;
  //             out.balance = balance.total;

  //             out.interestAmount = -currentAmount;
  //             currentAmount = 0;

  //           }else{
              
  //             balance.total = balance.total - balance.interest;
  //             out.balance = balance.total;

  //             out.interestAmount = -balance.interest;
  //             currentAmount = currentAmount - balance.interest;
  //             balance.interest = 0;
  //             out.interestBalance = balance.interest;


  //           }

  //         }
          
  //         if(currentAmount > 0){
  //           if(balance.principal > currentAmount){
  //             balance.principal = balance.principal - currentAmount;
  //             out.principalBalance = balance.principal;

  //             balance.total = balance.total - currentAmount;
  //             out.balance = balance.total;

  //             out.principalAmount = -currentAmount
  //             currentAmount = 0
  //           }else{
  //             balance.principal = 0;
  //             out.principalBalance = balance.principal;
  //             balance.total =  0;
  //             out.balance = balance.total;

              
  //             out.principalAmount = -balance.principal
  //             currentAmount = 0
  //           }
  //         }
  //         out.amount = -e.amount
  //       }


  //       return out
  //     })
  //     return records
  // })()

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
          <LoanModeler loanProfile={loan.loanProfile!} payments={payments} loanInfo={{date:moment(loan.date), readonly:true, principal:loan.principal}} />
          {/* //onChange={(data)=>setForm({...form,date:data.date, amount:data.principal})}  onPaymentsChange={(data)=>setPaymentData(data)} /> */}

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog> 
  

} 

export default ViewLoanAsBorrower