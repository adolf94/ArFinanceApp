                   import { Grid2 as Grid, Typography, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Button, Alert, InputAdornment, Chip, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LoanProfile } from "FinanceApi";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import NumberInput, { FormattedAmount } from "../../components/NumberInput";



interface LoanModelerProps {
    loanProfile: Partial<LoanProfile>,
    onPaymentsChange?: (data: Payment[])=>void
    onChange?: (data: any)=>void
}

export interface Payment {
    date: moment.Moment,
    amount: number,
    balance: number,
    index?: number,
    type: string,
    principalBalance: number,
    interestBalance: number,
    totalInterestPercent: number,
    minimumDate: moment.Moment
}


const LoanModeler = ({ loanProfile, onChange, onPaymentsChange }: LoanModelerProps) => {

    const [form, setForm] = useState({
        date: moment(),
        principal: 0,
        months:0
    })

    const [payments, setPayments] = useState<Payment[]>([])

    const addDate = () => {
        // check if there is already items
        let defaultDate = form.date.clone().add(1, 'day');
        if (payments.length != 0) {
            defaultDate = payments.reduce((prev, cur) => {
                if (prev.isBefore(cur.date)) return cur.date.clone().add(1,'day')
                return prev
            },defaultDate)
        }

        setPayments(prev => [...prev, {
            date: defaultDate,
            amount: 0, type: 'payment',
            principalBalance: 0,
            balance: 0,
            interestBalance: 0,
            minimumDate: defaultDate,
            totalInterestPercent: 0
        }])
        
    }



    const computedPayments = useMemo(() => {
        if(!loanProfile) return []


        const computeInterest = (lastInterest: moment.Moment, balance: any) => {
            const createDate = form.date;
            const days = lastInterest.diff(createDate, 'day')
            let totalInterest = 0;
            let nextDate;
            //check fixedConditions 
            const sort = loanProfile.fixed!.sort((a, b) => a.maxDays - b.maxDays)
            const useIndex = sort.findIndex(e => e.maxDays > (days));
            let interestPercent = 0;
            if (useIndex > -1) {
                if (useIndex == 0) {
                    interestPercent = sort[useIndex].interest
                } else {
                    interestPercent = sort[useIndex].interest - sort[useIndex - 1].interest

                }
                nextDate = createDate.clone().add(sort[useIndex].maxDays, 'days');
                totalInterest = sort[useIndex].interest;
            } else {
                nextDate = createDate.clone().add(1, 'month');
                totalInterest = loanProfile.interestPerMonth!;

                while (nextDate.isSameOrBefore(lastInterest)) {
                    nextDate.add(1, 'month')
                    totalInterest = totalInterest + loanProfile.interestPerMonth!;
                }

                if (loanProfile.computePerDay && balance.date.isBefore(nextDate)) {
                    //const curDaysInMonth = nextDate.daysInMonth()
                    const noOfDaysInMonth = nextDate.clone().add(-1,'month').daysInMonth();
                    console.log(noOfDaysInMonth)
                    const rebateDays = nextDate.clone().diff(balance.date.clone(), 'day');
                    const percent = (rebateDays / noOfDaysInMonth) * loanProfile.interestPerMonth!
                    totalInterest = totalInterest - percent
                    nextDate = balance.date.clone()
                }


                interestPercent = totalInterest - balance.totalInterestPercent
                if (interestPercent <= 0) interestPercent = 0

            }
            //compute interestFactor

            //{ value: 'principalBalance', label: 'Principal Balance' },
            //{ value: 'principalTotal', label: 'Principal Total' },
            //{ value: 'totalBalance', label: 'Total Balance' },
            let interest = -0;
            switch (loanProfile.interestFactor) {
                case "principalBalance":
                    interest = balance.principal * (interestPercent / 100)
                    break;
                case "principalTotal":
                    interest = form.principal * (interestPercent / 100)
                    break;
                case "totalBalance":
                    interest = balance.balance * (interestPercent / 100)
                    break;
            }


            const newItem = {
                date: lastInterest!,
                amount: -interest,
                type: 'interest',
                principalBalance: balance.principal,
                balance: balance.balance + interest,
                interestBalance: balance.interest + interest,
                minimumDate: lastInterest!,
                nextInterest: nextDate!,
                totalInterestPercent: totalInterest
            }
            return newItem;
        }




        let balance = form.principal
        let principal = form.principal
        let interest = 0
            
        let totalInterestPercent = 0;

        let nextInterest = form.date
        const computed = payments.reduce((prev: Payment[], cur, index) => {

            while (nextInterest.clone().isBefore(cur.date)) {
                const prior = {
                    date: cur.date,
                    interest,
                    principal,
                    balance,
                    totalInterestPercent
                }
                const interestData = computeInterest(nextInterest, prior);
                interest = interestData.interestBalance
                principal = interestData.principalBalance
                balance = interestData.balance
                nextInterest = interestData.nextInterest
                totalInterestPercent = interestData.totalInterestPercent
                if (interestData.amount !== 0) prev.push(interestData)
            }

            cur.balance = balance - cur.amount
            balance = cur.balance
            //deduct to interest;
            if (cur.type == "payment") {
                const payment = cur.amount;
                if (interest < payment) {
                    principal = principal - (payment - interest)
                    interest = 0

                    cur.interestBalance = 0;
                    cur.principalBalance = principal

                } else {
                    interest = interest - payment
                    cur.interestBalance = interest;
                    cur.principalBalance = principal

                }
            }
            cur.totalInterestPercent = totalInterestPercent


            cur.index = index
            prev.push(cur)
            return [...prev]
        }, [])
        return computed
    }, [form.principal, form.date, payments, loanProfile])

    useEffect(()=>{
        if(onChange) onChange(form)
    }, [form])

    useEffect(()=>{
        if(onPaymentsChange) onPaymentsChange(payments)
    },[payments])

    const changeModelValues = (index : number, field : string, newValue : any) => {
        const newArr = [...payments]
        let newItem = { ...newArr[index] }
        //@ts-ignore
        newItem[field] = newValue;
        newArr[index] = newItem
        setPayments(newArr)
    }


    return <Grid container>
        <Grid size={12} sx={{ pb: 1 }} display="block">
            <Typography variant="subtitle1">Model Loan Payments</Typography>
        </Grid>
        <Grid size={4} sx={{ pb: 2, px: 1 }}>
            <DatePicker label="Date of Loan" value={form.date}
                onAccept={newValue => setForm({...form, date:newValue!})}
                slots={{
                    textField: (params) => (
                        <TextField
                            {...params}
                        />)
                }} />
        </Grid>
        <Grid size={4} sx={{ pb: 2, px: 1 }}>
            <NumberInput label="Principal" value={form.principal} onChange={(value:string) => setForm({ ...form, principal: Number.parseFloat(value) })} fullWidth></NumberInput>
        </Grid>
        <Grid size={4} sx={{ pb: 2, px: 1 }}>
            <TextField label="# of Month" fullWidth></TextField>
        </Grid>
        <Grid size={12}>
            {!loanProfile ? <Alert variant="outlined" color="warning">Please select a loan profile first!</Alert> : 
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Balance</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Principal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                computedPayments.map((item, i) => {
                                    return item.type === "payment" ? <TableRow>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                            <DatePicker label="Payment date" value={item.date}
                                                minDate={item.minimumDate}
                                                onAccept={newValue => changeModelValues(item.index!, 'date', newValue)}
                                                slots={{
                                                    textField: (params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                        />)
                                                }} />
                                        </TableCell>
                                        <TableCell><NumberInput size="small" 
                                                            slotProps={{
                                                                input: {
                                                                    startAdornment : <InputAdornment position="start"> <Chip size="small" color="success" label="P"></Chip></InputAdornment>
                                                                }
                                                            }} value={item.amount} onChange={(value : string) => changeModelValues(item.index!, 'amount', value)} /></TableCell>

                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.balance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.interestBalance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.principalBalance)}</TableCell>
                                    </TableRow> : <TableRow>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell sx={{ pl: 4 }}>
                                        {item.date.format("MM/DD/YYYY")}
                                        </TableCell>
                                        <TableCell sx={{ pr: 4 }}>
                                            <Grid container sx={{justifyContent: 'space-between'}}>
                                                <Box sx={{pl:2}}>
                                                    <Chip size="small" color="error" label="I"></Chip>
                                                </Box>
                                                <Box>{FormattedAmount(item.amount)}</Box>
                                            </Grid>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.balance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.interestBalance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.principalBalance)}</TableCell>
                                    </TableRow>


                                })
                            }
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center' }} ><Button onClick={addDate}> Add Payment </Button></TableCell>
                            </TableRow>
                        </TableBody>
                        <TableFooter>
                            
                    </TableFooter>
                    </Table>
                </TableContainer>
            }
        </Grid>
    </Grid>
}

export default LoanModeler;