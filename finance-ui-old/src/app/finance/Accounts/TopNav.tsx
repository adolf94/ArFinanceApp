import { AppBar, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import React, { useLayoutEffect, useRef } from 'react';
import {
  Search as IcoSearch, NavigateBefore as IcoNavigateBefore, NavigateNext as IcoNavigateNext
  , Tune as IcoTune, Add as IcoAdd
  
} from '@mui/icons-material'
import { RefObject } from 'react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useHeaderContext from '../common/headerContext';
import { useNavigate } from 'react-router';

function TopNav() {
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useHeaderContext()
  const navigate = useNavigate()


  useLayoutEffect(() => {
    if (ref.current) {
      if (ref.current.offsetHeight != ctx.height)
      ctx.set({ ...ctx, height: ref.current.offsetHeight });
    }
  })


  return (

    <AppBar ref={ref} position="fixed">
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Toolbar variant="dense"  >
            <Typography>Accounts</Typography>
          </Toolbar>
        </Grid>
        <Grid item>

          <IconButton>
            <IcoAdd sx={{ color: 'primary.contrastText' }} onClick={() => navigate("new/892F20E5-B8DC-42B6-10C9-08DABB20FF77")} />
          </IconButton>

          <IconButton>
            <IcoTune sx={{ color: 'primary.contrastText' }} />
          </IconButton>
        </Grid>
      </Grid>
    </AppBar>
  );
}

export default TopNav;