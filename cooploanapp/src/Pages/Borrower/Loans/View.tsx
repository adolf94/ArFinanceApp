import { Dialog, DialogContent, Grid2 as Grid, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { getByLoanId, LOAN } from "../../../repositories/loan"
import { useEffect, useState } from "react"
import moment from "moment"
import BackdropLoader from "../../../components/BackdropLoader"



interface ViewLoanAsBorrowerProps {

}

const ViewLoanAsBorrower = (props: ViewLoanAsBorrowerProps) => {

  const {loanid} = useParams()
  const { data: loan, isLoading: loading } = useQuery({ queryKey: [LOAN,{loanId: loanid}], queryFn: () => getByLoanId(loanid!), enabled:!!loanid })
  const [summary, setSummary] = useState({balance:0,interest:0, payments:0})
  console.log(loan)
  useEffect(()=>{
    if(!loan) return
    let payments = loan.payment.reduce((p,c)=>{return p + c.amount},0)
    let interest = loan.interestRecords.reduce((p,c)=>{return p + c.amount},0)
    let balance = loan.principal + interest - payments
    setSummary({balance, interest, payments})
  },[loan])




  const transactions = (()=>{
    if(!loan) return []
    const balance = {
      total : loan.principal,
      interest : 0,
      principal: loan.principal
    }

    let interest = loan.interestRecords.map(e=>({...e,date:e.dateStart,type:'interest'}))
    let payments = loan.payment.reduce((p,c)=>{
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

    let records = [...payments, ...interest]
      .sort((a,b)=>a.date==b.date?0: a.date>b.date?1:-1)
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
      return records
  })()

  return !!loading || loan ?  <BackdropLoader /> 
    :<Dialog open maxWidth="md" fullWidth>
      <DialogContent>
        <Grid container>
          <Grid container size={6}>
            <Grid size={12}>
              <Typography variant="body2">Date Start:</Typography>
              <Typography variant="body2">{moment(loan.date).format("MMM DD,YYYY")}</Typography>
            </Grid>


          </Grid>
          <Grid size={6}>
          {/* <LoanModeler loanProfile={form.profile!} onChange={(data)=>setForm({...form,date:data.date, amount:data.principal})}  onPaymentsChange={(data)=>setPaymentData(data)} /> */}

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  

} 

export default ViewLoanAsBorrower