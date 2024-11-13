import {Card,
  CardContent, Dialog, DialogContent, DialogTitle, Grid2 as Grid, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material"
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
import { Close } from "@mui/icons-material"



interface ViewLoanAsBorrowerProps {

}

const ViewLoanAsBorrower = (props: ViewLoanAsBorrowerProps) => {

  const {loanId} = useParams()
  const { data: loan, isLoading: loading } = useQuery({ queryKey: [LOAN,{loanId: loanId}], queryFn: () => getByLoanId(loanId!) })
  const [summary, setSummary] = useState({balance:0,interest:0, payments:0})
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
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
    :<Dialog open maxWidth="lg" fullScreen={fullScreen} fullWidth onClose={()=>navigate("../")}>
        <DialogTitle>
          <Grid container justifyContent="space-between">
            <Typography variant="h5">Loan History</Typography>
            <IconButton onClick={()=>navigate("../")}>
              <Close />
            </IconButton>
          </Grid>
        </DialogTitle>
        <DialogContent>
        <Grid container>
          <Grid  size={{xs:12, md:4}} sx={{pb:3}} alignSelf="start">
            <Card onClick={() => navigate("./loan/" + loan.orig.id)}>
            <CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
              <Grid container direction="column">
                <Grid container sx={{justifyContent:'space-between'}}>

                  <Typography  sx={{fontWeight:"bold",pt:1}} gutterBottom={false}>
                    Date Created: {moment(loan.date).format("MMM DD")}
                  </Typography>
                </Grid>

                <Typography variant="caption" gutterBottom={false}>
                  Principal: {FormattedAmount(loan.principal)}
                </Typography>
                <Typography variant="caption" gutterBottom={false}>
                  Interest: {FormattedAmount(summary.interest)}
                </Typography>
                <Typography variant="caption" gutterBottom={false}>
                  Payments: {FormattedAmount(summary.payments)}
                </Typography>
                <Grid container  sx={{pt:1, justifyContent:'space-between'}}>
                  <Grid container direction="column"	>
                    <Typography variant="h5" gutterBottom={false}>
                      {FormattedAmount(loan.nextPayment?.amount)}
                    </Typography>
                    <Typography variant="caption" gutterBottom={false}>
                      Next Payment
                    </Typography>
                    <Typography variant="caption" gutterBottom={false}>
                      Before {moment(loan.nextPayment?.date).format("MMM DD")}
                    </Typography>

                  </Grid>
                  <Grid>
                    <Typography variant="h5" sx={{textWeight:'bold',textAlign:'right'}} gutterBottom={false}>
                      {FormattedAmount(summary.balance)}
                    </Typography>
                    <Typography variant="caption" sx={{textAlign:'right'}} gutterBottom={false}>
                      Outstanding Balance
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

            </CardContent>
          </Card>
          </Grid>
          <Grid size={{xs:12, md:8}}>
          <LoanModeler addCurrentDate loanProfile={loan.loanProfile!} payments={payments} expectedPayments={loan.expectedPayments}
                       loanInfo={{date:moment(loan.date), readonly:true, principal:loan.principal}} />
          {/* //onChange={(data)=>setForm({...form,date:data.date, amount:data.principal})}  onPaymentsChange={(data)=>setPaymentData(data)} /> */}

          </Grid>
        </Grid>
      </DialogContent>
    </Dialog> 
  

} 

export default ViewLoanAsBorrower