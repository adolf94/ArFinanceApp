import React, { useState, useEffect, useContext } from 'react'
import { Grid, List, ListItem } from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import useDropdown from '../../components/useDropdown'
import { v4 as uid} from 'uuid'
import api from '../../components/api'
import db from '../../components/LocalDb'
const SelectAccount = (props) => {
  const { accountGroups, accounts,vendors } = useDropdown()
  const [accountGroup, setAccountGroup] = useState(null)
  const [account, setAccount] = useState(null)
  const { view } = props

  useEffect(() => {
    view.setViewContext({ searchValue: "" })
    if(view?.onChange) view.onChange(account)
  }, [account])

  useEffect(() => {
    setAccountGroup(null)
  }, [view.groupId])

  const newVendor = () => {
    const item = { name: view.searchValue, accountTypeId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", id: uid() }
    view.setViewContext({ searchValue: "" })
    api.post("vendors", item)
      .then(e => {
        db.vendors.put(e.data)
      }).catch(() => {
        db.vendors.put({ ...item, push: true })
      }).finally(() => {
        setAccount(item)
      })
  }

  return <Grid container>
    {view && view.type == "account" ?<>
    <Grid item xs={6}>
      <List>
          {
            accountGroups.filter(e => e.accountTypeId == view.groupId).map(e => <ListItem button
              selected={e.id == accountGroup?.id}
              onClick={()=>setAccountGroup(e)}
              secondaryAction={<FontAwesomeIcon icon={faChevronRight} />}>
              { e.name }
            </ListItem>)
          }
      </List>
    </Grid>
    <Grid item xs={6}>
      <List>
        {
            accounts.filter(e => accountGroup && e.accountGroupId == accountGroup?.id).map(f => <ListItem button
              selected={f.id == account?.id}
              onClick={() => setAccount(f)}>
              {f.name}
            </ListItem>)
          }
        </List>

      </Grid> </>: null}
    {
      view && view.type == "vendor" ? 

        <Grid item xs={6}>
          <List>
            {view.searchValue != "" ? <ListItem button onClick={newVendor}>
              Add "{view.searchValue}"
            </ListItem> : null}
            {
              vendors.sort((a,b)=>a.name==b.name?0:(a.name<b.name?1:-1)).map(f => <ListItem button
                selected={f.id == account?.id}
                onClick={() => setAccount(f)}>
                {f.name}
              </ListItem>)
            }
          </List>

        </Grid>:null
    }
  </Grid>
}

export default SelectAccount