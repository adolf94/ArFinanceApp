import { Box, Button, Card, FormControl, Grid2 as Grid, InputLabel, MenuItem, Paper, Select, Typography } from "@mui/material"
import CreateLoanProfile from "./CreateLoanProfile"
import moment from 'moment'
import { useState } from "react"
import NumberInput from "../../../components/NumberInput"
import CoopOption from "./CoopOptions"


const SettingsIndex = () => {



  return <Grid container sx={{ width: "100%" }}>
    <Grid size={12}>
      <CreateLoanProfile>
        <Button variant="text"> Create Loan Profile</Button>
      </CreateLoanProfile>
    </Grid>
    <Grid size={6}>
      <CoopOption />
    </Grid>

  </Grid>
}

export default SettingsIndex