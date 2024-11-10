import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Grid2 as Grid,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import {DatePicker} from "@mui/x-date-pickers";
import {LoanProfile, PaymentPlan} from "FinanceApi";
import moment from "moment";
import {useEffect, useMemo, useState} from "react";
import NumberInput, {FormattedAmount} from "../../components/NumberInput";
import {Delete} from "@mui/icons-material";
import {generateCompute} from "../../components/useComputeInterest";


interface LoanModelerProps {
    loanProfile: Partial<LoanProfile>,
    loanInfo?: {principal:number, date: moment.Moment, readonly?: boolean}
    payments?: Partial<Payment>[]
    expectedPayments?: PaymentPlan[]
    onPaymentsChange?: (data: Payment[])=>void
    onChange?: (data: any)=>void,
    addCurrentDate?: boolean
}

export interface Payment {
    date: moment.Moment,
    amount: number,
    balance: number,
    index?: number,
    readonly?:boolean,
    type: string,
    principalBalance: number,
    interestBalance: number,
    totalInterestPercent: number,
    minimumDate: moment.Moment
}



const dateDropdown = ()=>{
    let items = []
    items.push({month:0, label: "Custom", isCustom:true})

    for(let i = 1 ; i<= 12; i++){
        items.push({month:i, label: `${i} month/s`, isCustom:false})
    }
    return items;
}

const LoanModeler = ({
                     loanProfile,  loanInfo, onChange, onPaymentsChange,addCurrentDate,payments : previousPayments }
                     : LoanModelerProps) => {

    const [form, setForm] = useState({
        date: loanInfo?.date || moment(),
        principal: loanInfo?.principal || 0,
        readonly: !!loanInfo?.readonly,
        months:0
    })
    const [customPayments] = useState<Payment[]>([])

    const [payments, setPayments] = useState<Payment[]>([])
    const [month, setSelectedMonth] = useState({month:0, label: `Custom`, isCustom:true})

    useEffect(() => {
        
        if(!addCurrentDate || !loanProfile.computePerDay) return;
        // let shouldAdd = !expectedPayments || expectedPayments.every(e=>moment().isAfter(e.date))
        // if(!shouldAdd) return
            setPayments([{
            date: moment(),
            amount: 0, type: 'payment',
            principalBalance: 0,
            balance: 0,
            interestBalance: 0,
            minimumDate: moment(),
            totalInterestPercent: 0,
            readonly:false
        }])
    }, []);
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
            totalInterestPercent: 0,
            readonly:false
        }])
        
    }
    const setMonth = (data : any)=>{
        if(data.isCustom){
            setPayments(customPayments);
            setSelectedMonth(data);
            return
        }

        //@ts-ignore
        const computeInterest = generateCompute(form, {...loanProfile, computePerDay:false});

        let items = []
        
        let balance = form.principal
        let principal = form.principal
        let interest = 0
            
        let totalInterestPercent = 0;
        let nextInterest = form.date.clone().add(1,'day')

        for(let i = 1; i<=data.month;i++){
            let thisInterest = 0
            
            let thisDate = form.date.clone().add(i,'month')
            while (nextInterest.clone().isBefore(thisDate)) {
                const prior = {
                    date: nextInterest.clone(),
                    interest,
                    principal,
                    balance,
                    totalInterestPercent
                }
                ;
                const interestData = computeInterest(nextInterest, prior);
                interest = interestData.interestBalance
                principal = interestData.principalBalance
                thisInterest =  interestData.amount + thisInterest;
                balance = interestData.balance
                nextInterest = interestData.nextInterest
                totalInterestPercent = interestData.totalInterestPercent
            }
            console.log(thisInterest)

            let payment = (form.principal/data.month) - thisInterest
            if (interest < payment) {
                principal = principal - (payment - interest)
                interest = 0
            } else {
                interest = interest - payment
            }
            interest = 0 ;
            let item = {
                date: thisDate.clone(),
                amount: (form.principal/data.month) - thisInterest, 
                type: 'payment',
                principalBalance: principal,
                balance: balance,
                interestBalance: 0,
                minimumDate: thisDate,
                totalInterestPercent: totalInterestPercent
            }
            items.push(item)
        }
        setPayments(items)
        setSelectedMonth(data);

    }


    const computedPayments = useMemo(() => {
        if(!loanProfile) return []

        //@ts-ignore
        const computeInterest = generateCompute(form, loanProfile);


        let balance = form.principal
        let principal = form.principal
        let interest = 0
            
        let totalInterestPercent = 0;
        let previousPaymentsAndModelPayments = [...(previousPayments || []).map(e=>({...e,readonly:true })),...payments.map((e,i)=>({...e,index:i}))]
        let nextInterest = form.date
        return previousPaymentsAndModelPayments.reduce((prev: Payment[], cur: any) => {

            while (nextInterest.clone().isBefore(cur.date)) {
                const prior = {
                    date: cur.date.clone(),
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

            cur.balance = balance - cur.amount!
            balance = cur.balance
            //deduct to interest;
            if (cur.type == "payment") {
                const payment = cur.amount!;
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


            prev.push(cur!)
            return [...prev]
        }, [])
    }, [form.principal, form.date, payments, loanProfile, previousPayments])

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
        <Grid size={{xs:12,sm:4}} sx={{ pb: 2, px: 1 }}>
            <DatePicker label="Date of Loan" disabled={form.readonly} value={form.date}
                        onAccept={newValue => setForm({...form, date:newValue!})}
                        slots={{
                    textField: (params) => (
                        <TextField
                            {...params}
                        />)
                }} />
        </Grid>
        <Grid size={{xs:12,sm:4}} sx={{ pb: 2, px: 1 }}>
            <NumberInput label="Principal" disabled={form?.readonly} value={form.principal} onChange={(value:string) => setForm({ ...form, principal: Number.parseFloat(value) })} fullWidth></NumberInput>
        </Grid>
        <Grid size={{xs:12,sm:4}} sx={{ pb: 2, px: 1 }}>
                        <Autocomplete
                          value={month}
                          onChange={(_event, newValue) => {
                            setMonth(newValue);
                          }}
                          getOptionKey={ e=>e.month}
                          getOptionLabel={e=>e?.label || ""}
                          readOnly={loanInfo?.readonly}
                          fullWidth
                          options={ dateDropdown() || []}
                          renderInput={(params) => <TextField {...params}  label="Months to pay" />}
                          
                        />
        </Grid>
        <Grid size={12}>
            {!loanProfile ? <Alert variant="outlined" color="warning">Please select a loan profile first!</Alert> : 
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell sx={{minWidth:'8rem'}}>Payment</TableCell>
                                <TableCell>Balance</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Principal</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                computedPayments.map((item, i) => {
                                    return item.type === "payment" ? <TableRow>
                                        <TableCell>{i + 1}</TableCell>
                                       
                                        {
                                            item.readonly?  <TableCell sx={{ pl: 4 }}>
                                                    {item.date.format("MM/DD/YYYY")}
                                            </TableCell>: <TableCell>
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
                                        }
                                        {
                                            
                                            item.readonly?  <TableCell sx={{ pr: 4 }}>
                                            <Grid container sx={{justifyContent: 'space-between'}}>
                                                <Box sx={{pl:2}}>
                                                    <Chip size="small" color="success" label="P"></Chip>
                                                </Box>
                                                <Box>{FormattedAmount(item.amount)}</Box>
                                            </Grid>
                                        </TableCell> : <TableCell><NumberInput size="small" 
                                                            slotProps={{
                                                                input: {
                                                                    startAdornment : <InputAdornment position="start"> <Chip size="small" color="success" label="P"></Chip></InputAdornment>
                                                                }
                                                            }} value={item.amount} onChange={(value : string) => changeModelValues(item.index!, 'amount', value)} /></TableCell>
                                        }
                                        

                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.balance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.interestBalance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{FormattedAmount(item.principalBalance)}</TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{!item.readonly && <IconButton><Delete fontSize="small" /></IconButton>}</TableCell>
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
                                        <TableCell sx={{ textAlign: 'right' }}></TableCell>
                                    </TableRow>


                                })
                            }
                            <TableRow>
                                <TableCell colSpan={7} sx={{ textAlign: 'center' }} ><Button onClick={addDate}> Add Payment </Button></TableCell>
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