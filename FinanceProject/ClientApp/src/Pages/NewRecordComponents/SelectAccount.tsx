﻿import { useQuery } from "@tanstack/react-query"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups"
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts"
import { Box, Dialog, Grid, IconButton, List, ListItem, Portal, TextField, Typography, useMediaQuery, useTheme } from "@mui/material"
import { Close, ArrowForwardIos as IcoArrowForwardIos} from '@mui/icons-material'
import React, { useEffect, useState } from "react"
import { Account, AccountGroup, Vendor } from "FinanceApi"
import { v4 as uuid } from 'uuid'
import { fetchVendors, useMutateVendor, VENDOR } from '../../repositories/vendors'
import Calculator from "../../components/Calculator"

interface SelectAccountProps<T>{
  value: T,
  onChange: (value: T) => void,
  onClose: () => void,
  selectType: string,
  typeId?: string,
  show: boolean,
  internalKey: string
}


function SelectAccount(props: SelectAccountProps<any>) {
    const { data: accountGroups, isLoading: groupLoading } = useQuery({ queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups })
  const { data: accounts, isLoading: acctLoading } = useQuery({ queryKey: [ACCOUNT], queryFn: fetchAccounts })
  const { data: vendors, isLoading: vendorLoading } = useQuery<Vendor[]>({ queryKey: [VENDOR], queryFn: fetchVendors })
    const [searchQuery, setSearchQuery] = useState("") 
  const mutateVendor = useMutateVendor()

    const [acctGroup, setAcctGroup] = useState<AccountGroup | Vendor>()
    const [acct, setAcct] = useState<Account>()
    const theme = useTheme()
  const sm = useMediaQuery(theme.breakpoints.down('lg'));

  const filteredGroups = (accountGroups || []).filter(e => e.accountTypeId == props.typeId)
    const setValue = (value) => {
        setAcct(value)
        props.onChange(value)
    }
    
    useEffect(() => {
      if(!props.value) return 
      const value = props.value;
      if (props.selectType == "account") {
        if (value.accountGroup == null) value.accountGroup = (accountGroups || []).find(e=>e.id == value.accountGroupId)
        setAcctGroup(value.accountGroup)
        setAcct(value)
      }
    }, [props.value])


  const createNewVendor = () => {
    mutateVendor.create({

      id: uuid(),
      name: searchQuery,
      enabled: true
    }).then(e => {
      props.onChange(e)
      setSearchQuery("")
      props.onClose()
    })
  }


  const onClose = () => {
    setSearchQuery("")
    props.onClose()
  }


  const filteredVendors = (vendors || []).filter(f => f.name.indexOf(searchQuery) > -1)


  return <Grid container> 
    <Grid item xs={12} sx={{px:2,pt:1} }>
          <Grid container sx={{display:'flex', justifyItems:'center'} }>
            <Grid item sx={{ flexGrow: 1 }}>
          {props.selectType == "vendor" ? <TextField value={searchQuery} fullWidth onChange={evt => setSearchQuery(evt.target.value)} variant="standard" placeholder="Search Vendors" />
            : <Typography variant="body1" sx={{pt:1} }>Select</Typography>}
            </Grid>
            <Grid item sx={{ flexShrink: 1 }} ><IconButton onClick={() => onClose()}><Close /></IconButton></Grid>
          </Grid>
      </Grid>
    {props.selectType == "account" && !groupLoading
        &&<>
          <Grid item xs={6}>
                <List>
          {(accountGroups || []).filter(e => e.accountTypeId == props.typeId).map((e, i) => {
            console.log(acctGroup?.name + " " + e.name + " " + (e.id === acctGroup?.id).toString())

            return <ListItem button
              selected={!!acctGroup && e.id === acctGroup?.id}
              onClick={() => setAcctGroup(e)}
              key={(i)} >
              {e.name}
            </ListItem>
          })}
                </List>
            </Grid>
                <Grid item xs={6}>
                    <List>
                      {(accounts || []).filter(e => acctGroup && e.accountGroupId == acctGroup?.id).map(f => <ListItem button
                            selected={f.id == acct?.id}
                              onClick={() => setValue(f)}
                            key={(props.internalKey + "_" + f.id)}
                        >
                            {f.name}
                      </ListItem>)}

                    </List>
      </Grid>
    </>}
        {props.selectType == "vendor"   
            && 
                <Grid item xs={8}>
                  <List>
                  {
                    (filteredVendors || []).map((e,i) => <ListItem button
                      selected={e.id == acct?.id}
                      onClick={() => setValue(e)}
                      key={(i)} >
                      {e.name}
                    </ListItem>)
                  }
              {searchQuery && !filteredVendors.some(f=>f.name.startsWith(searchQuery))
                && <ListItem button
                  onClick={createNewVendor}
                >
                  Add "{searchQuery}"
                </ListItem>
              }
            </List>
            </Grid>}
   </Grid >
}

function SelectAccountContainer (props: SelectAccountProps<any>) {



  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('lg'));


  return <>
    {props.show && !sm && <Box display={{ xs: "none", sm: 'block' }}>
      {props.selectType !== "calculate" && <SelectAccount {...props} />}
      {props.selectType === "calculate" && <Calculator {...props} />}
    </Box>
    }
    <Dialog open={props.show && sm} fullScreen  sx={{
        position: "absolute",
        top: "30%"
      }} maxWidth="lg">
      {props.selectType !== "calculate" && <SelectAccount {...props} />}
      {props.selectType === "calculate" && <Calculator {...props} />}
    </Dialog>
  </>
}


export default SelectAccountContainer