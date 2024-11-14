import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
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
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import {DatePicker} from "@mui/x-date-pickers";
import {LoanProfile, PaymentPlan} from "FinanceApi";
import moment from "moment";
import {useEffect, useMemo, useState} from "react";
import NumberInput, {FormattedAmount} from "../../components/NumberInput";
import {Delete} from "@mui/icons-material";
import {generateCompute} from "../../components/useComputeInterest";
import DatePickerWithBlur from "../../components/DatePickerWithBlur";
import {v4 as uuid} from 'uuid'

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
    id:string,
    date: moment.Moment,
    amount: number,
    balance: number,
    index?: number,
    readonly?:boolean,
    type: string,
    principalBalance: number,
    interestBalance: number,
    totalInterestPercent: number,
    nextInterest: moment.Moment,
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

    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));



    const [payments, setPayments] = useState<Payment[]>([])
    const [month, setSelectedMonth] = useState({month:0, label: `Custom`, isCustom:true})

    useEffect(() => {
        setForm({
            ...form,
            date: loanInfo?.date || moment(),
            principal: loanInfo?.principal || 0,
            readonly: !!loanInfo?.readonly,
            months:0
        })
    }, [loanInfo]);
    
    useEffect(() => {
        
        // if(!addCurrentDate || !loanProfile.computePerDay) return;
        // let shouldAdd = !expectedPayments || expectedPayments.every(e=>moment().isAfter(e.date))
        // if(!shouldAdd) return
        if(addCurrentDate === false) return
            setPayments([{
                id: uuid(),
                date: moment(),
                amount: 0, type: 'payment',
                principalBalance: 0,
                balance: 0,
                interestBalance: 0,
                minimumDate: moment(),
                totalInterestPercent: 0, 
                nextInterest: moment(),
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
            readonly:false,
            nextInterest:moment(),
            id: uuid()
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
                totalInterestPercent: totalInterestPercent,
                id:uuid(),
                nextInterest:moment()
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
        return previousPaymentsAndModelPayments.reduce((prev: Payment[], cur: any, i:number) => {
            let interestId = 0
            while (nextInterest.clone().isBefore(cur.date)) {
                const prior = {
                    date: cur.date.clone(),
                    interest,
                    principal,
                    balance,
                    totalInterestPercent
                }
                const interestData = computeInterest(nextInterest, prior);
                interestId++
                let toAdd : Payment = {...interestData,readonly:true, id :cur.id + interestId.toString()}
                interest = interestData.interestBalance
                principal = interestData.principalBalance
                balance = interestData.balance
                nextInterest = interestData.nextInterest
                totalInterestPercent = interestData.totalInterestPercent
                if (interestData.amount !== 0) prev.push(toAdd)
            }
            interestId++
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
            cur.index = i;
            cur.id = cur.id + interestId.toString()
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

    const deletePayment = (index:number)=>{
        payments.splice(index,1)
        setPayments([...payments])
    }
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
            <Typography variant="caption">Model Loan Payments</Typography>
        </Grid>
        <Grid size={{xs:6,sm:4}} sx={{ pb: 2, px: 1 }}>
            <DatePickerWithBlur label="Date of Loan" disabled={form.readonly} value={form.date}
                        onChange={(newValue:moment.Moment) =>setForm({...form, date:newValue!})}
                                fullWidth
                        slots={{
                       textField: (params:any) => (
                        <TextField
                            
                            {...params}
                        />)
                }} />
        </Grid>
        <Grid size={{xs:6,sm:4}} sx={{ pb: 2, px: 1 }}>
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
        {smallScreen &&  <Grid container size={12}>
            {
                computedPayments.map((item) => {

                    if(item.readonly){
                        return  <Grid size={12} key={item.id}>
                            <Card variant="outlined">
                                <Box sx={{p:2}} >
                                    <Box sx={{fontSize:'small', fontWeight:'bold', pb:1}}>
                                        {item.date.format("MMM DD")}
                                        {item.type=="interest" && ` - ${item.nextInterest.clone().add(-1,'day').format("MMM DD")}` }
                                    </Box>
                                    <Box sx={{'display':'flex', justifyContent:'space-between'}}>
                                        {
                                            item.type=="payment" ? <Box sx={{color:'green', fontWeight:'bold'}}>Payment</Box>
                                                : <Box sx={{color:'red'}}>Interest</Box>
                                        }

                                        <Box>{FormattedAmount(-item.amount)}</Box>
                                    </Box>
                                    <Box sx={{'display':'flex', justifyContent:'space-between'}}>
                                        <Box>Running Balance</Box>
                                        <Box>{FormattedAmount(item.balance)}</Box>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    }
                    return  <Grid size={12} key={item.id}>
                        <Card variant="outlined">
                            <Grid container sx={{p:2}} >
                                <Grid size={12} sx={{fontSize:'small', fontWeight:'bold', pb:1}}>
                                    Proposed payment
                                </Grid>
                                <Grid size={6} sx={{py:1}}>
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
                                </Grid>
                                <Grid size={6} sx={{pl:1 ,py:1}}>
                                    <NumberInput label="Payment Amount" size="small" value={item.amount} onChange={(value : string) => changeModelValues(item.index!, 'amount', value)} />
                                </Grid>
                                <Grid size={12} sx={{'display':'flex', justifyContent:'space-between'}}>
                                    <Box>Running Balance</Box>
                                    <Box>{FormattedAmount(item.balance)}</Box>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid>

                })
            }
		  <Grid size={12} sx={{textAlign:'center', pt:3}}>
			<Button variant="contained" fullWidth color="success" onClick={addDate}> Add Payment for computation </Button>
		  </Grid>
		</Grid>
        }
        {!smallScreen && <Grid container size={12}>
            {!loanProfile  ? <Alert variant="outlined" color="warning">Please select a loan profile first!</Alert> :
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
                                        <TableCell sx={{ textAlign: 'right' }}>{!item.readonly && <IconButton onClick={()=>deletePayment(item.index!)}><Delete fontSize="small" /></IconButton>}</TableCell>
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
        </Grid>}
    </Grid>
}

export default LoanModeler;