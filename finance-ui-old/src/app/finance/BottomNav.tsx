import { AppBar, IconButton, Toolbar, Grid } from '@mui/material';
import React, { useLayoutEffect, useRef } from 'react';
import { Storage as IcoStorage, AccountBalance as IcoAccountBalance, Settings as IcoSettings } from '@mui/icons-material'
import useHeaderContext from './common/headerContext';
import { useNavigate } from 'react-router';

function BottomNav() {
  const ref = useRef<HTMLDivElement>(null)
  const ctx = useHeaderContext()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if(!!ref.current && ref.current.offsetHeight != ctx.bottomHeight)
    ctx.set({...ctx,bottomHeight: ref.current.offsetHeight})
  })


  return (
    <AppBar ref={ref} position="fixed" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Grid container sx={{display:'flex', justifyContent:"center"} }>
          <Grid item >
            <IconButton>
              <IcoStorage onClick={ ()=>navigate("transactions")} />
            </IconButton>
            <IconButton>
              <IcoAccountBalance onClick={() => navigate("accounts")} />
            </IconButton>
            <IconButton>
              <IcoSettings />
            </IconButton>
          </Grid>
        </Grid>

      </Toolbar>
    </AppBar>
  );
}

export default BottomNav;