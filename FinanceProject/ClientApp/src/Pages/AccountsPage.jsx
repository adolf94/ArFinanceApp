﻿import { Button, Grid, MenuItem, Menu } from '@mui/material'
import React, { useState } from 'react'
import Accounts from './Accounts'
import AppBar from '@mui/material/Appbar'
import Toolbar from '@mui/material/Toolbar'
import { Typography  } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import SettingsAccountType from './SettingAccountsType'
import NewAccountGroup from './SettingAccountGroup'
import NewAccount from './SettingsNewAccount'


const AccountsPage = (props) => {
  const [showType, setShowType] = useState(false)
  const [showGroup, setShowGroup] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [ellRef, setEllRef] = useState(null)


  const handleMenu = (evt) => {
    console.log(evt.target)
    setEllRef(evt.target)
  }
  const handleMenuSelect = (stateToTrue) => {
    stateToTrue(true)
    setEllRef(null)
  }



  return <> <AppBar position="static">
    <Toolbar>
        <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">Accounts</Typography>
        <IconButton size="large" color="inherit" onClick={handleMenu}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </IconButton>
      <Menu anchorEl={ellRef} keepMounted open={Boolean(ellRef)} onClose={() => handleMenuSelect(() => { })}>
        <MenuItem onClick={() => handleMenuSelect(setShowAccount)}>Add Account</MenuItem>
        <MenuItem onClick={() => handleMenuSelect(setShowGroup)}>Add Acct Group</MenuItem>
        <MenuItem onClick={() => handleMenuSelect(setShowType)}>Add Acct Type</MenuItem>
        <MenuItem onClick={handleMenuSelect}>Sort</MenuItem>
        <MenuItem onClick={handleMenuSelect}>Show/Hide</MenuItem>
      </Menu>
    </Toolbar>
    </AppBar>
    <Grid container >
      <Grid container sx={{pt:3}} direction="row-reverse" justifyContent="flex-start">
        <Button variant="outlined" onClick={() => setShowGroup(true)}>Add Group</Button>
      </Grid>
      <Grid container>
          <Accounts></Accounts>
      </Grid>
      
      <SettingsAccountType show={showType} handleClose={()=>setShowType(false) } />
      <NewAccountGroup show={showGroup} handleClose={() => setShowGroup(false)} />
      <NewAccount show={showAccount} handleClose={() => setShowAccount(false)} />
    </Grid>
  </>
}

export default AccountsPage