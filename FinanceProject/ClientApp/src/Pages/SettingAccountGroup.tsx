
import {
  TextField, DialogActions, Dialog, Button, Select, DialogTitle,
  DialogContent, MenuItem, FormControl, InputLabel, Box
} from '@mui/material'
import React from 'react'
import { useEffect, useState } from 'react'
import api from '../components/api'
import useDropdown from '../components/useDropdown'
import db from '../components/LocalDb'
import { ACCOUNT_TYPE, fetchTypes } from '../repositories/accountTypes'
import { useQuery } from '@tanstack/react-query'
import { useMutateGroups } from '../repositories/accountgroups'
import { AccountGroup } from 'FinanceApi'






const NewAccountGroup = (props : any) => {
  const { handleClose, show} = props
  
  const { data: accountTypes, isLoading: loadingTypes } = useQuery({ queryKey: [ACCOUNT_TYPE], queryFn: fetchTypes })
  const mutateGroups = useMutateGroups()
  const { accountGroups, set } = useDropdown()
  const [form, setForm] = useState<Partial<AccountGroup>>({
    name: "",
    accountTypeId: null,
    accountType: null,
    enabled: true
  })


  const createNewAccountGroup = () => {


     mutateGroups.createAsync({
      name: form.name,
      accountTypeId: form.accountTypeId,
      enabled: true
     }).then(() => {
       handleClose()

       setForm({
         name: "",
         accountTypeId: null,
         accountType: null,
         enabled: true
       })
     })

  }

  return <>
    <Dialog open={show} onClose={handleClose} >
      <DialogTitle>New Type</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          <div className="mt-2">
            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="demo-select-small">Account Type</InputLabel>
              <Select value={form.accountType?.name} label="Account Type">
                {(accountTypes||[]).map(d => <MenuItem key={d.id} value={d.name} onClick={() => setForm({ ...form, accountType: d, accountTypeId: d.id })}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1 }}>
              <TextField label="Account Type Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} variant="standard" />
            </FormControl>
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={createNewAccountGroup}>Create</Button>
      </DialogActions>
    </Dialog>
  </>

}

export default NewAccountGroup