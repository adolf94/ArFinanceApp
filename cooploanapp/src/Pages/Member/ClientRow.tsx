import {getUserById, USER} from "../../repositories/users";
import {Loan, LoanInterest, LoanPayment} from "FinanceApi";
import {FormattedAmount} from "../../components/NumberInput";

import {useEffect, useState} from "react"
import {ArrowDropDown, ArrowRight} from "@mui/icons-material"
import moment from "moment"
import { useQuery } from "@tanstack/react-query";
import {TableCell, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";
interface  ClientRowProps  {
    item : { userId : string, loans : Loan[]}
}


const ClientRow = ({item} : ClientRowProps)=>{
    const navigate = useNavigate()    
    const {data: client} = useQuery({queryKey:[USER,{userId: item.userId}], queryFn:()=>getUserById(item.userId)})
    const loans = item.loans
    
    const [expand,setExpand] = useState(false)
    const [total,setTotal] = useState<any>({})
    const [loanCalculation,setLoanCalculated] = useState<any>([])
    
    useEffect(()=>{
    
        let total = {
            principal: 0,
            interest: 0,
            payments:0,
            balance:0
        }
    
        let loansCalculated = (loans||[]).map((l :any)=>{
            let payments = l.payment.reduce((p : number,c : LoanPayment)=>{ return c.amount + p },0)
            let interest = l.interestRecords.reduce((p : number,c : LoanInterest )=>{ return  c.amount + p  },0)
            total.principal = total.principal + Number.parseFloat(l.principal);
            total.interest = total.interest +  interest;
            total.payments = total.payments +  Number.parseFloat(payments);
    
            return {
                date: l.date,
                principal: l.principal,
                interests: interest,
                payments: payments,
                balance: l.principal + interest - Number.parseFloat(payments),
                orig: l
            }
        })
        setLoanCalculated(loansCalculated)
        setTotal({...total, balance: total.interest + total.principal - total.payments})
    
    },[loans])
    
    
    
    return <>
        <TableRow>
            <TableCell onClick={()=>setExpand(!expand)}>{expand? <ArrowDropDown /> : <ArrowRight /> } </TableCell>
            <TableCell onClick={()=>setExpand(!expand)}> {client?.name} </TableCell>
            <TableCell> {FormattedAmount(total.principal)} </TableCell>
            <TableCell> {FormattedAmount(total.interest)}</TableCell>
            <TableCell> {FormattedAmount(total.payments)} </TableCell>
            <TableCell> {FormattedAmount(total.balance)} </TableCell>
        </TableRow>
        {expand  && (loanCalculation || []).map((l:any)=><TableRow key={l.orig.id} onClick={()=>navigate(`./loan/${l.orig.id}`)}>
            <TableCell></TableCell>
            <TableCell>{moment(l.date).format("YYYY-MM-DD")}</TableCell>
            <TableCell>{FormattedAmount(l.principal)}</TableCell>
            <TableCell>{FormattedAmount(l.interests)}</TableCell>
            <TableCell>{FormattedAmount(l.payments)}</TableCell>
            <TableCell>{FormattedAmount(l.balance)}</TableCell>
        </TableRow>)}
    </>

}

export default ClientRow