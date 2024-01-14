import { useQuery } from "@tanstack/react-query"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups"
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts"
import { Box, Dialog, Grid, List, ListItem, Portal, useMediaQuery, useTheme } from "@mui/material"
import { ArrowForwardIos as IcoArrowForwardIos} from '@mui/icons-material'
import React, { useEffect, useState } from "react"
import { Account, AccountGroup, Vendor } from "FinanceApi"

interface SelectAccountProps<T>{
  value: T,
  onChange: (value: T) => void,
  selectType: string,
  typeId?: string,
  selectPortal: any,
  show: boolean,
  searchStr:string,
  internalKey: string
}


function SelectAccount(props: SelectAccountProps<any>) {
    const { data: accountGroups, isLoading: groupLoading } = useQuery({ queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups })
  const { data: accounts, isLoading: acctLoading } = useQuery({ queryKey: [ACCOUNT], queryFn: fetchAccounts })


    const [acctGroup, setAcctGroup] = useState<AccountGroup | Vendor>()
    const [acct, setAcct] = useState<Account>()


  const filteredGroups = (accountGroups || []).filter(e => e.accountTypeId == props.typeId)
    const setValue = (value) => {
        setAcct(value)
        props.onChange(value)
    }
    
    useEffect(() => {
      if(!props.value) return 
      const value = props.value;
      if (props.selectType == "account") {
        if (value.accountGroup == null) value.accountGroup = (accountGroups || []).find(e=>e.id = value.accountGroupId)
        setAcctGroup(value.accountGroup)
        setAcct(value)
      }
    }, [props.value])

  const newVendor = () => {

  }


    return <>
      {props.selectType == "account" && !groupLoading
            && <Grid container><Grid item xs={6}>
                <List>
            {(accountGroups || []).filter(e => e.accountTypeId == props.typeId).map((e, i) => <ListItem button
                      selected={e.id === acctGroup?.id}
                      onClick={() => setAcctGroup(e)}
                      key={(i)} >
                        {e.name}
                    </ListItem>)}
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
            </Grid>}
        {props.selectType == "vendor"
            && <Grid container>
                <Grid item xs={8}>
                    <List>
              {props.searchStr
                && <ListItem button
                  onClick={() => { }}
                >
                  Add {props.searchStr}
                </ListItem>
              }
            </List>
                </Grid>
            </Grid>}

    </>
}

function SelectAccountContainer (props: SelectAccountProps<any>) {



  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('lg'));


  return <>
    {props.show && !sm && <Box display={{ xs: "none", sm: 'block' }}>
      <SelectAccount {...props} />
    </Box>
    }
    <Dialog open={props.show && sm} fullScreen  sx={{
      position: "absolute",
      top: "30%"
}} maxWidth="lg">
      <SelectAccount {...props} />
    </Dialog>
  </>
}


export default SelectAccountContainer