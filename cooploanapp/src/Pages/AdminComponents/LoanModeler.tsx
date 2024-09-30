import { Grid2 as Grid, Typography, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LoanProfile } from "FinanceApi";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";



interface LoanModelerProps {
    loanProfile: Partial<LoanProfile>
}

interface Payment {
    date: moment.Moment,
    amount: number,
    balance: number,
    index?: number,
    type:string,
    minimumDate: moment.Moment
}

const NumberField = (props: any) => {


    const [value,setValue] = useState(props.value)

    return <TextField {...props} value={value} onBlur={props.onChange} onChange={(evt)=>setValue(evt.target.value)}></TextField>



}

const LoanModeler = (props: LoanModelerProps) => {
    const [form, setForm] = useState({
        date: moment(),
        principal: 0,
        months:0
    })

    const [payments, setPayments] = useState<Payment[]>([])

    const addDate = () => {
        // check if there is already items
        let defaultDate = form.date.add(1, 'day');
        if (payments.length != 0) {
            defaultDate = payments.reduce((prev, cur) => {
                if (prev.isBefore(cur.date)) return cur.date.add(1,'day')
                return prev
            },defaultDate)
        }

        setPayments(prev => [...prev, {date:defaultDate, amount:0,type:'payment', balance: 0, minimumDate: defaultDate}])
        
    }

    const computedPayments = useMemo(() => {
        let balance = form.principal
        let computed = payments.reduce((prev : Payment[], cur, index) => {
            cur.balance = balance - cur.amount
            cur.index = index
            balance = cur.balance
            prev.push(cur)
            return [...prev]
        }, [])
        return computed
    }, [payments, form])


    const changeModelValues = (index : number, field : string, newValue : any) => {
        const newArr = [...payments]
        let newItem = { ...newArr[index] }
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
            <NumberField label="Principal" value={form.principal} onChange={(evt : any) => setForm({ ...form, principal: Number.parseFloat(evt.target.value) })} fullWidth></NumberField>
        </Grid>
        <Grid size={4} sx={{ pb: 2, px: 1 }}>
            <TextField label="# of Month" fullWidth></TextField>
        </Grid>
        <Grid size={12}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Payment</TableCell>
                            <TableCell>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            computedPayments.map((item, i) =>
                            <TableRow>
                                    <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                        <DatePicker label="Payment date" value={item.date}
                                            onAccept={newValue => changeModelValues(item.index!, 'date', newValue)}
                                        slots={{
                                            textField: (params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                />)
                                        }} />
                                </TableCell>
                                    <TableCell><NumberField size="small" type="number" value={item.amount} onChange={(evt) => changeModelValues(item.index!, 'amount', evt.target.value)} /></TableCell>
                                    <TableCell>{ item.balance }</TableCell>
                            </TableRow>)
                        }
                        <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>
                                <DatePicker label="Payment date"
                                slots={{
                                    textField: (params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                            />)
                                    }} />
                            </TableCell>
                            <TableCell><TextField size="small" type="number"  /></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><Typography variant="body1"> Balance </Typography></TableCell>
                            <TableCell><Typography variant="body1"> P 1, 000 </Typography></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3} sx={{ textAlign: 'center' }} ><Button onClick={addDate}> Add Payment </Button></TableCell>
                        </TableRow>
                    </TableBody>
                    <TableFooter>
                   </TableFooter>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
}

export default LoanModeler;