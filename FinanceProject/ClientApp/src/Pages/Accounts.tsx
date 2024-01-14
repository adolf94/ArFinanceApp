import React from 'react'
import { Divider, List, useMediaQuery, ListItem, ListItemText, Grid } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useQuery } from '@tanstack/react-query'
import { ACCOUNT_GROUP, fetchGroups } from '../repositories/accountgroups'
import { fetchAccounts, ACCOUNT } from '../repositories/accounts'
import numeral from 'numeral'

const Accounts = (props) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))

  const { data: accountGroups } = useQuery({queryKey:[ACCOUNT_GROUP], queryFn: fetchGroups})
  const { data: accounts } = useQuery({ queryKey: [ACCOUNT], queryFn: fetchAccounts })

  //const { accountTypes, accountGroups, accounts, set } = useDropdown()


  return <Grid item xs={ 12 }>
    <List onLoad={() => { } }>
      {
        (accountGroups || []).map(e => <>
          <Divider textAlign="left">{e.name}</Divider>
          {(accounts || [] ).filter(a => e.id == a.accountGroupId).map((a) => <ListItem button secondaryAction={<span>{numeral(a.balance).format("0.00")}</span>}><ListItemText primary={a.name} /></ListItem>)}
        </>)
      }


    </List>
  </Grid>
}

export default Accounts