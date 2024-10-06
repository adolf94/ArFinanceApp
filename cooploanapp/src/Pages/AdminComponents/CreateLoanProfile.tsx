/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Delete, Save }
    from "@mui/icons-material"
import {
    Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, FormControlLabel, FormHelperText, Grid2 as Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField
} from "@mui/material"
import { LoanProfile, FixedInterests } from "FinanceApi"
import { ReactElement, useState } from "react"
import api from "../../components/api"
import LoanModeler from "./LoanModeler"
import { useNavigate } from "react-router-dom"


const interestFactors = [
    { value: 'principalBalance', label:'Principal Balance' },
    { value: 'principalTotal', label:'Principal Total' },
    { value: 'totalBalance', label: 'Total Balance' },

]


const CreateLoanProfile = ({ children }: {children : ReactElement}) => {
    const [form, setForm] = useState<Partial<LoanProfile>>({
        loanProfileName: "",
        interestPerMonth: 0.00,
        computePerDay: false,
        interestFactor: 'principalBalance',
        fixed: []
    })

    const [condition, setCondition] = useState<FixedInterests>({
        maxDays: 0,
        interest: 0
    })
    const navigate = useNavigate()
    const [add, setAdd] = useState(false)
    const [show, setShow] = useState(false)
    const [showModel, setShowModel] = useState(false)


    const createCondition = () => {
        if (condition.maxDays == 0) return
        setForm((prev) => {
            const newState = { ...prev }
            //@ts-ignore
            newState.fixed.push({ ...condition })
            return newState
        })
        setAdd(false)
        setCondition({
            maxDays: 0,
            interest: 0
        })

    }

    const saveProfile = () => {

        api.post("/loanprofile", form)
            .then(() => {
                navigate("../")
            })

    }


    return <Grid container>
        <Box component="span" onClick={()=>setShow(true)}>{children}</Box>
        
        <Dialog open={show} maxWidth="lg" fullWidth onClose={() => setShow(false)} >
            <DialogTitle>Create new Loan Profile</DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid container size={{ md: 5, sm: 12 }} alignSelf="start" sx={{ p: 2, display: { sm: (showModel?'none':'flex'), md: 'flex' }} }>
                        
                        <Grid size={12} sx={{ pb: 2 }}>
                            <TextField label="Profile Name" fullWidth value={form.loanProfileName}
                                onChange={(evt) => setForm({ ...form, loanProfileName: evt.target.value })}
                            />
                        </Grid>
                        <Grid size={12} sx={{ pb: 2 }} >
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Interest Factor</InputLabel>
                                <Select
                                    id="demo-simple-select"
                                    value={form.interestFactor || ""}
                                    label="Interest Factor"
                                >
                                    {interestFactors.map(e => <MenuItem key={e.value} value={e.value}
                                        onClick={() => setForm({ ...form, interestFactor: e.value })}>{e.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={4} sx={{ pb: 2 }} >
                            <TextField label="Interest per month" fullWidth value={form.interestPerMonth} type="number"
                                onChange={(evt) => setForm({ ...form, interestPerMonth: Number.parseFloat(evt.target.value) })}
                            />
                        </Grid>
                        <Grid size={8} sx={{ pb: 2, pl: 2 }} >
                            <FormControlLabel sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} control={<Checkbox checked={form.computePerDay} onChange={(evt) => setForm({ ...form, computePerDay: evt.target.checked })} />} label="Compute per day" />
                            <FormHelperText>Usually enabled if early payments is allowed</FormHelperText>
                        </Grid>
                        <Grid size={12}>
                            <TableContainer >
                                <Table size="small" >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>Fixed Rules. (Helpful for minimum maturiry rules/cap on interest) </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Interest</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {form.fixed!.map(f => <TableRow>
                                            <TableCell>{` <= ${f.maxDays} days`} </TableCell>
                                            <TableCell>{f.interest} %</TableCell>
                                            <TableCell sx={{ flexShrink: 1 }}>
                                                <IconButton >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>)}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            {
                                                add ? <>
                                                    <TableCell >
                                                        <TextField value={condition.maxDays} type="number"
                                                            size="small"
                                                            onChange={(evt) => setCondition({ ...condition, maxDays: Number.parseInt(evt.target.value) })}
                                                            slotProps={{
                                                                input: {
                                                                    style: { textAlign: 'right' },
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            Days
                                                                        </InputAdornment>
                                                                    ),
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            {" <="}
                                                                        </InputAdornment>
                                                                    ),
                                                                },
                                                            }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField value={condition.interest} type="number"
                                                            onChange={(evt) => setCondition({ ...condition, interest: Number.parseInt(evt.target.value) })}
                                                            size="small"
                                                            slotProps={{
                                                                input: {
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            %
                                                                        </InputAdornment>
                                                                    ),
                                                                },
                                                            }} /></TableCell>
                                                    <TableCell sx={{ flexShrink: 1 }}>
                                                        <IconButton onClick={createCondition}>
                                                            <Save />
                                                        </IconButton>
                                                        <IconButton onClick={() => {
                                                            setAdd(false)
                                                            setCondition({ maxDays: 0, interest: 0 })
                                                        }}>
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </> :
                                                    <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                                                        <Button onClick={() => setAdd(true)}>Add condition</Button>
                                                    </TableCell>

                                            }
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                    <Grid container alignSelf="start" size={{ md: 7, sm: 12 }} sx={{ p: 2, display: { sm: (showModel?'flex':'none'), md: 'flex' } }}>
                       
                        <LoanModeler loanProfile={form} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container sx={{px:3,justifyContent:'space-between', width:'100%'} }>
                    <Grid>
                        {showModel ? <Button onClick={() => setShowModel(false)}> {"<"} Return to Loan Profile </Button> : <Button onClick={() => setShowModel(true)}>  Model Loan/Payments </Button> }
                        
                    </Grid>
                    <Grid>
                        <Button onClick={saveProfile}> Create </Button>
                    </Grid>
                    
                </Grid>

            </DialogActions>
        </Dialog>
    </Grid>

}

export default CreateLoanProfile