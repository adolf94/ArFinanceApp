import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Skeleton } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { USER, getAll } from "../../../repositories/users"
import {Loan, LoanInterest, LoanPayment, User} from "FinanceApi"
import { getByUserId, LOAN } from "../../../repositories/loan"
import { useEffect, useState } from "react"
import {  ArrowDropDown, ArrowRight } from "@mui/icons-material"
import moment from "moment"
import { FormattedAmount } from "../../../components/NumberInput"
import { useNavigate } from "react-router-dom"
import {generateCompute} from "../../../components/useComputeInterest";
import {usePaymentContext} from "./AdminBody";



const LoanClientRow = ( {client} : {client : User}  )=>{
  const ctx = usePaymentContext()

  const [expand,setExpand] = useState(false)
  const [total,setTotal] = useState<any>({})
  const [loanCalculation,setLoanCalculated] = useState<any>([])
  const { data: loans, isLoading: loading } = useQuery<Loan[]>({ queryKey: [LOAN,{userId: client.id}], queryFn: () => getByUserId(client.id), enabled:!!client?.id })
  const navigate = useNavigate()
  

  useEffect(()=>{
    let total = {
      principal: 0,
      interest: 0,
      payments:0,
      balance:0
    }

    let loansCalculated = (loans||[]).map((l : Loan)=>{
      let payments = l.payment.reduce((p : number,c : LoanPayment)=>{ return c.amount + p },0)
      let principal = l.payment.reduce((p: number,c:LoanPayment)=>{return  p - (c.againstPrincipal? c.amount: 0)},l.principal)
      let interest = l.interestRecords.reduce((p : number,c: LoanInterest)=>{ return c.amount + p },0)

      
      let computeInterest = generateCompute({principal: total.principal, date:moment(l.date), interestRecords: [...l.interestRecords], nextInterestDate:moment(l.nextInterestDate)}, l.loanProfile)
      if(moment().isBefore(l.nextInterestDate) && l.loanProfile.computePerDay){
        let discount = computeInterest.computeDiscount(moment(), {
              balance: principal + interest - payments,
              date: moment(),
              interest: interest,
              principal: principal,
              totalInterestPercent: l.totalInterestPercent
            })
           interest = interest - discount.discountAmount
           
        
      }
      
      total.principal = total.principal + l.principal;
      total.interest = total.interest +  interest;
      total.payments = total.payments +  payments;
      let res = {
        date:l.date,
        id:l.id,
        principal: l.principal,
        interests: interest,
        payments: payments,
        balance: l.principal + interest - payments,
        orig: l
      }
      return res
    })
    setLoanCalculated(loansCalculated)
    setTotal({...total, balance: total.interest + total.principal - total.payments})

  },[loans])

  const onClickCheck = (item: {id:string, balance:number})=>{
      if(ctx.payCtx.userId !=  client.id ){
        ctx.setPayCtx({
          userId: client.id,
          items : [{
            id: item.id,
            balance: item.balance
          }]
        })
        return
      }

    const included:boolean = ctx.payCtx.items.some((e:any)=>e.id==item.id)
    
    if(!included){
      ctx.setPayCtx({
        ...ctx.payCtx,
        items:[...ctx.payCtx.items, {
          id: item.id,
          balance: item.balance
        }]
      })
    }else{
      let newData = {...ctx.payCtx}
      newData.items = newData.items.filter((e:any)=>e.id!=item.id)
      ctx.setPayCtx(newData)
    }
    
  }
  

  return <>
  <TableRow>
    <TableCell sx={{textAlign:'center'}} onClick={()=>setExpand(!expand)}>{expand? <ArrowDropDown /> : <ArrowRight /> } </TableCell>
    <TableCell  onClick={()=>setExpand(!expand)}>{client.name}</TableCell>
    {
      loading ? <>
            <TableCell><Skeleton variant="text" /></TableCell>
            <TableCell><Skeleton variant="text" /></TableCell>
            <TableCell><Skeleton variant="text" /></TableCell>
            <TableCell><Skeleton variant="text" /></TableCell>
          </> 
          : <>
            <TableCell>{FormattedAmount(total.principal)}</TableCell>
            <TableCell>{FormattedAmount(total.interest)}</TableCell>
            <TableCell>{FormattedAmount(total.payments)}</TableCell>
            <TableCell>{FormattedAmount(total.balance)}</TableCell>
          </>
    }
    <TableCell></TableCell>
  </TableRow>
  {expand && !loading && (loanCalculation || []).map((l:any)=><TableRow key={l.id} onClick={()=>navigate(`../loan/${l.orig.id}`)}>
    <TableCell><Checkbox onChange={()=>onClickCheck(l)} checked={ctx.payCtx.items.some((e:any)=>e.id==l.id)}/></TableCell>  
    <TableCell>{moment(l.date).format("YYYY-MM-DD")}</TableCell>
    <TableCell>{FormattedAmount(l.principal)}</TableCell>
    <TableCell>{FormattedAmount(l.interests)}</TableCell>
    <TableCell>{FormattedAmount(l.payments)}</TableCell>
    <TableCell>{FormattedAmount(l.balance)}</TableCell>
  </TableRow>)}
</>
}


const LoansTable = () => {


  const { data: clients, isLoading: loading } = useQuery({ queryKey: [USER], queryFn: () => getAll() })


  return <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Client </TableCell>
          <TableCell>Principal </TableCell>
          <TableCell>Interests</TableCell>
          <TableCell>Payments</TableCell>
          <TableCell>Balance</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          !loading ? clients.map((e:User)=> <LoanClientRow key={e.id} client={e} />):
            <TableRow>
              <TableCell></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
            </TableRow>
        }
      </TableBody>
    </Table>
  </TableContainer>
}


export default LoansTable