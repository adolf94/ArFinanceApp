import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, formControlClasses } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { USER, getAll } from "../../../repositories/users"
import { User } from "FinanceApi"
import { getByUserId, LOAN } from "../../../repositories/loan"
import { useEffect, useState } from "react"
import {  ArrowDropDown, ArrowRight } from "@mui/icons-material"
import moment from "moment"
import { FormattedAmount } from "../../../components/NumberInput"
import { useNavigate } from "react-router-dom"



const LoanClientRow = ( {client} : {client : User}  )=>{

  const [expand,setExpand] = useState(false)
  const [total,setTotal] = useState<any>({})
  const [loanCalculation,setLoanCalculated] = useState<any>([])
  const { data: loans, isLoading: loading } = useQuery({ queryKey: [LOAN,{userId: client.id}], queryFn: () => getByUserId(client.id), enabled:!!client?.id })
  const navigate = useNavigate()

  useEffect(()=>{

    let total = {
      principal: 0,
      interest: 0,
      payments:0,
      balance:0
    }

    let loansCalculated = (loans||[]).map((l :any)=>{
      let payments = l.payment.reduce((p : number,c)=>{ return Number.parseFloat(c.amount) + p },0)
      let interest = l.interestRecords.reduce((p : number,c)=>{ return Number.parseFloat(c.amount) + p },0)
      total.principal = total.principal + Number.parseFloat(l.principal);
      total.interest = total.interest +  interest;
      total.payments = total.payments +  Number.parseFloat(payments);

      let res = {
        date:l.date,
        principal: l.principal,
        interests: interest,
        payments: payments,
        balance: l.principal + interest - Number.parseFloat(payments),
        orig: l
      }
      return res
    })
    setLoanCalculated(loansCalculated)
    setTotal({...total, balance: total.interest + total.principal - total.payments})

  },[loans])


  return <>
  <TableRow>
    <TableCell onClick={()=>setExpand(!expand)}>{expand? <ArrowDropDown /> : <ArrowRight /> } </TableCell>
    <TableCell  onClick={()=>setExpand(!expand)}>{client.name}</TableCell>
    <TableCell>{FormattedAmount(total.principal)}</TableCell>
    <TableCell>{FormattedAmount(total.interest)}</TableCell>
    <TableCell>{FormattedAmount(total.payments)}</TableCell>
    <TableCell>{FormattedAmount(total.balance)}</TableCell>
  </TableRow>
  {expand && !loading && (loanCalculation || []).map((l:any)=><TableRow key={l.orig.id} onClick={()=>navigate(`../loan/${l.orig.id}`)}>
    <TableCell></TableCell>
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
          !loading && clients.map((e:User)=> <LoanClientRow key={e.id} client={e} />)
        }
      </TableBody>
    </Table>
  </TableContainer>
}


export default LoansTable