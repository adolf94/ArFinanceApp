import { Box, Button, Grid, Portal, Stack, TextField, Typography } from '@mui/material'
import React, { useRef, useState } from 'react'
import TopNav from '../TopNav'
import useHeaderContext from '../../common/headerContext'
import { DateTimePicker } from '@mui/x-date-pickers'
import moment from 'moment'
import TwoLevelSelector from './TwoLevelSelector'


const NewTransaction = () => {

  const ctx = useHeaderContext()
  const container = useRef(null)
  const [form, setForm] = useState({
      date: moment()
    })

  return <>
    <Box>
      <TopNav />
      <Stack sx={{ mt: ctx.height + 'px' }}>
        <Grid container sx={{py:2} }>
          <Grid xs={4} sx={{ px: 1 }}>
            <Button variant="contained" fullWidth>Income</Button>
          </Grid>
          <Grid xs={4} sx={{ px: 1 }}>
            <Button variant="contained" fullWidth>Expense</Button>
          </Grid>
          <Grid xs={4} sx={{ px: 1 }}>
            <Button variant="contained" fullWidth>Transfer</Button>
          </Grid>
        </Grid>
        <Grid container sx={{ alignItems: 'center', mb:1 }}>
          <Grid xs={4}>
            <Typography>Date/Time</Typography>
          </Grid>
          <Grid xs={8}>
            <DateTimePicker
              value={moment(form.date)}
              onChange={(newValue) => setForm({ ...form, date: newValue })}
              slots={{
                textField: (props) => <TextField {...props} variant="standard" fullWidth />
              }}
            />
          </Grid>
        </Grid>
        <Grid container sx={{ alignItems: 'center', mb: 1 }}>
          <Grid xs={4}>
            <Typography>Vendor</Typography>
          </Grid>
          <Grid xs={8}>
            <TextField fullWidth variant="standard" />
          </Grid>
        </Grid>
        <Grid container sx={{ alignItems: 'center', mb: 1 }}>
          <Grid xs={4}>
            <Typography>Asset</Typography>
          </Grid>
          <Grid xs={8}>
            <TextField fullWidth variant="standard" />
            <Portal container={container.current}>
              <TwoLevelSelector />
            </Portal>
          </Grid>
        </Grid>
        <Grid container sx={{ alignItems: 'center', mb: 1 }}>
          <Grid xs={4}>
            <Typography>Category</Typography>
          </Grid>
          <Grid xs={8}>
            <TextField fullWidth variant="standard" />
          </Grid>
        </Grid>
        <Grid container sx={{ alignItems: 'center', mb: 1 }}>
          <Grid xs={4}>
            <Typography>Amount</Typography>
          </Grid>
          <Grid xs={8}>
            <TextField fullWidth variant="standard" />
          </Grid>
        </Grid>
        <Grid container>
          <Grid xs={12} ref={container}>
          </Grid>
        </Grid>
      </Stack>
    </Box>

  </>
}

export default NewTransaction