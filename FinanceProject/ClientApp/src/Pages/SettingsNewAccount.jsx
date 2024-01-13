import {
  TextField, DialogActions, Dialog, Button, Select, DialogTitle,
  DialogContent, MenuItem, FormControl, InputLabel, Box
} from '@mui/material'
import react, { useEffect, useState } from 'react'
import api from '../components/api'
import useDropdown from '../components/useDropdown'
import db from '../components/LocalDb'

const NewAccount = (props) => {
  const { show, handleClose } = props
  const { accountTypes, accountGroups,accounts, set } = useDropdown()
  const [form, setForm] = useState({
    name: "",
    accountTypeId: null,
    accountType: null,
    accountGroupId: null,
    accountGroup: null,
    balance:0,
    enabled: true
  })


  const createNewAccount = () => {
    api.post("accounts", {
      name: form.name,
      accountGroupId: form.accountGroupId,
      enabled: true
    }).then((res) => {
      setForm({
        name: "",
        accountTypeId: null,
        accountType: null,
        enabled: true
      })
      db.accounts.add(res.data)
      handleClose()
    })
  }

  return <>
    <Dialog open={show} onClose={handleClose} >
      <DialogTitle>New Type</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 3 }}>
          <div className="mt-2" size="small">
            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="demo-select-small">Account Type</InputLabel>
              <Select value={form.accountType?.name} label="Account Type">
                {accountTypes.map(d => <MenuItem key={d.id} value={d.name} onClick={() => setForm({ ...form, accountType: d, accountTypeId: d.id })}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div className="mt-2" size="small">
            <FormControl sx={{ m: 1, minWidth: 200 }}>
              <InputLabel id="demo-select-small">Account Type</InputLabel>
              <Select value={form.accountGroup?.name} label="Account Group">
                {accountGroups.filter(g => form.accountType?.id == g.accountTypeId).map(d => <MenuItem key={d.id} value={d.name} onClick={() => setForm({ ...form, accountGroup: d, accountGroupId: d.id })}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1 }}>
              <TextField label="Account Type Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} variant="standard" />
            </FormControl>
          </div>
          <div>
            <FormControl sx={{ m: 1 }}>
              <TextField label="Balance" inputProps={{ inputMode: 'numeric', pattern: '[0-9\.]*' }} fullWidth value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} variant="standard" />
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