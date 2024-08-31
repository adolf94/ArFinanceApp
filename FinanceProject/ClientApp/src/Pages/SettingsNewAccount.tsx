import {
  TextField, DialogActions, Dialog, Button, Select, DialogTitle,
  DialogContent, MenuItem, FormControl, InputLabel, Box
} from '@mui/material'
import react, { useEffect, useState } from 'react'
import api from '../components/api'
import React from 'react'
import db from '../components/LocalDb'
import { ACCOUNT_TYPE, fetchTypes } from '../repositories/accountTypes'
import { useQuery } from '@tanstack/react-query'
import { ACCOUNT_GROUP, fetchGroups } from '../repositories/accountgroups'
import { Account, AccountGroup, AccountType } from 'FinanceApi'
import { useMutateAccount } from '../repositories/accounts'

const NewAccount = (props) => {
  const { show, handleClose } = props
  const {data:accountTypes} = useQuery<AccountType[]>({queryKey:[ACCOUNT_TYPE], queryFn: fetchTypes})
  const { data: accountGroups } = useQuery<AccountGroup[]>({ queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups })
  const [accountType, setAccountType] = useState<AccountType>(null)

  const { createAsync } = useMutateAccount()

  const [form, setForm] = useState<Partial<Account>>({
    name: "",
    balance:0,
    enabled: true
  })


  const createNewAccount = () => {

    createAsync(form)
      .then(() => {
        setForm({
          name: "",
          balance: 0,
          enabled: true
        })
        handleClose();
      })
  }

  return <>
      <Dialog open={show} maxWidth="sm" fullWidth onClose={handleClose} >
      <DialogTitle>New Account</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          <div className="mt-2">
            <FormControl fullWidth sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="demo-select-small">Account Type</InputLabel>
              <Select value={accountType?.id} label="Account Type">
                {(accountTypes || []).map(d => <MenuItem key={d.id} value={d.id} onClick={() => {
                    setAccountType(d)
                    setForm({...form, accountGroup:null, accountGroupId:""})
                  }
                }>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="mt-2">
            <FormControl fullWidth sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="demo-select-small">Account Group</InputLabel>
              <Select value={form.accountGroupId || ''} label="Account Group">
                {(accountGroups || []).filter(g => accountType?.id == g.accountTypeId).map(d => <MenuItem key={d.id} value={d.id} onClick={() => setForm({ ...form, accountGroup: d, accountGroupId: d.id })}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div>
            <FormControl fullWidth sx={{ m: 1 }}>
              <TextField label="Account Type Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} variant="standard" />
            </FormControl>
          </div>
          <div>
                      <FormControl fullWidth sx={{ m: 1 }}>
                          <TextField label="Balance" inputProps={{ inputMode: 'numeric', pattern: '[0-9\.]*' }} fullWidth value={form.balance} onChange={(e) => setForm({ ...form, balance: Number.parseFloat(e.target.value) })} variant="standard" />
                        </FormControl>
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={createNewAccount}>Create</Button>
      </DialogActions>
    </Dialog>
  </>
}

export default NewAccount