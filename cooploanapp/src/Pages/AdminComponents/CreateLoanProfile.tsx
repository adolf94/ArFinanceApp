import { Box, Checkbox, FormControl, FormControlLabel, FormHelperText, Grid2 as Grid, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import { useState } from "react"


const interestFactors = [
    { value: 'principalBalance', label:'Principal Balance' },
    { value: 'principalTotal', label:'Principal Total' },
    { value: 'totalBalance', label: 'Total Balance' },

]


const CreateLoanProfile = () => {
    const [form, setForm] = useState({
        loanProfileName: "",
        interestPerMonth: 0.00,
        computePerDay: false,
        interestFactor: 'principalBalance'
    })

		

		return <Grid container>

				
				<Grid size={ 12 } sx={{pb:2} }>
            <TextField label="Profile Name" fullWidth value={form.loanProfileName}
                onChange={(evt) => setForm({ ...form, loanProfileName:evt.target.value })}
            />
				</Grid>
				<Grid size={12} sx={{ pb: 2 }} >
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Interest Factor</InputLabel>
                <Select
                    id="demo-simple-select"
                    value={form.interestFactor|| ""}
                    label="Interest Factor"
                >
                    {interestFactors.map(e => <MenuItem key={e.value} value={e.value} 
                        onClick={() => setForm({ ...form, interestFactor: e.value })}>{e.label}</MenuItem>)}
                </Select>
            </FormControl>
        </Grid>
        <Grid size={6} sx={{ pb: 2 }} >
            <TextField label="Interest per month" fullWidth value={form.interestPerMonth} type="number"
                onChange={(evt) => setForm({ ...form, interestPerMonth: Number.parseFloat(evt.target.value) })}
            />
        </Grid>
        <Grid size={6} sx={{ pb: 2, pl:2 }} >
            <FormControlLabel sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }} control={<Checkbox checked={form.computePerDay} onChange={(evt) => setForm({ ...form, computePerDay: evt.target.checked }) } />} label="Compute per day" />
            <FormHelperText>Usually enabled if early payments is allowed</FormHelperText>
        </Grid>
        <Grid size={12}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Duration</TableCell>
                            <TableCell>Interest</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                      
                </Table>
            </TableContainer>
        </Grid>
    </Grid>

}

export default CreateLoanProfile