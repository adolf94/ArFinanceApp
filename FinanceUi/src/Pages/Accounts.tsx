import React from 'react'
import { Divider, List, useMediaQuery, ListItem, ListItemText, Grid, ListItemButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useQuery } from '@tanstack/react-query'
import { ACCOUNT_GROUP, fetchGroups } from '../repositories/accountgroups'
import { fetchAccounts, ACCOUNT } from '../repositories/accounts'
import numeral from 'numeral'
import { useNavigate } from 'react-router-dom'

const Accounts = (props) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const navigate = useNavigate();
  const { data: accountGroups } = useQuery({queryKey:[ACCOUNT_GROUP], queryFn: fetchGroups})
  const { data: accounts } = useQuery({ queryKey: [ACCOUNT], queryFn: fetchAccounts })

  //const { accountTypes, accountGroups, accounts, set } = useDropdown()


  return <Grid item xs={ 12 }>
    <List onLoad={() => { } }>
      {
              (accountGroups || []).map(e => <React.Fragment key={e.id}>
                <Divider textAlign="left" key={ e.id }>{e.name}</Divider>
                {(accounts || []).filter(a => e.id == a.accountGroupId).map((a) => <ListItem key={e.id} secondaryAction={<span>{numeral(a.balance).format("0,0.00")}</span>}>
                    <ListItemButton key={e.id} onClick={() => navigate("/accounts/" + a.id)} >{a.name}</ListItemButton>
                  </ListItem>)}
        </React.Fragment>)
      }


    </List>
  </Grid>
}

export default Accounts