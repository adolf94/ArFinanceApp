import React from 'react'
import AppBar from '@mui/material/Appbar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import { Divider, List, useMediaQuery, ListItem, ListItemText, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import useDropdown from '../components/useDropdown'
import numeral from 'numeral'


const Accounts = (props) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const { accountTypes, accountGroups, accounts, set } = useDropdown()


  return <Grid item xs={ 12 }>
    <List>
      {
        accountGroups.map(e => <>
          <Divider textAlign="left">{e.name}</Divider>
          {accounts.filter(a => e.id == a.accountGroupId).map((a) => <ListItem button secondaryAction={<span>{numeral(a.balance).format("0.00")}</span>}><ListItemText primary={a.name} /></ListItem>)}
        </>)
      }


    </List>
  </Grid>
}

export default Accounts