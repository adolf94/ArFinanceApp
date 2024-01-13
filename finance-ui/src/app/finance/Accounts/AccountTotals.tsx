import { Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import useHeaderContext from '../common/headerContext';

function AccountTotals() {
  const ctx = useHeaderContext()
  return (
    <Grid container sx={{ mt: ctx.height + 'px',display: "center", justifyContent: 'center' }}>
      <Grid item sx={{p:1} }>
        <Stack sx={{ textAlign: 'center' }} >
          <Typography variant="subtitle2">Assets</Typography>
          <Typography fontWeight={600} color="success.main">200,000.00</Typography>
        </Stack>
      </Grid>
      <Grid item sx={{ p: 1 }}>
        <Stack sx={{ textAlign: 'center' }} >
          <Typography variant="subtitle2">Liabilities</Typography>
          <Typography fontWeight={600} color="error.main">200,000.00</Typography>
        </Stack>
      </Grid>
      <Grid item sx={{ p: 1 }}>
        <Stack sx={{ textAlign: 'center' }} >
          <Typography variant="subtitle2">Total</Typography>
          <Typography fontWeight={600} >200,000.00</Typography>
        </Stack>
      </Grid>

    </Grid>
  );
}

export default AccountTotals;