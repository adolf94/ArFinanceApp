import { Box, Button, Card, Grid2 as Grid, Paper, Typography } from "@mui/material"
import CreateLoanProfile from "./CreateLoanProfile"
import moment from 'moment'

const years = (()=>{
  let initial = 2023
  let items = []
  while(initial <= moment().add(1,'year').year()){
    items.push(initial)
    initial++
  }
})()

const SettingsIndex = () => {




  return <Grid container sx={{ width: "100%" }}>
    <Grid size={12}>
      <CreateLoanProfile>
        <Button variant="text"> Create Loan Profile</Button>
      </CreateLoanProfile>
    </Grid>
    <Grid size={12}>
      <Card variant="outlined"  sx={{ p: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography gutterBottom variant="h6" component="div">
            Coop Options
          </Typography>
        </Box>
      </Card>
    </Grid>

  </Grid>
}

export default SettingsIndex