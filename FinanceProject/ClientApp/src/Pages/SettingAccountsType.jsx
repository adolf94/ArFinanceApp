import { TextField, DialogActions, Dialog,Button, DialogTitle, DialogContent } from '@mui/material'
import react, { useEffect, useState } from 'react'
import api from '../components/api'
import useDropdown from '../components/useDropdown'

import db from '../components/LocalDb'
const NewAccountType = (props) => {
  const { show, handleClose } = props
  const [value, setValue] = useState("")
  const { accountTypes, set } = useDropdown()

  const createNewAccountType = () => {
    api.post("accounttypes", {
      name: value,
      enabled:true
    }).then((res) => {
      console.log(res.data)
      setValue("")
      db.accountTypes.add(res.data)
      
      handleClose()
    })
  }

  return <>
    <Dialog open={show} onClose={handleClose} >
      <DialogTitle>New Type</DialogTitle>
      <DialogContent>
        <TextField label="Account Group Name" value={value} onChange={(e) => setValue(e.target.value)} variant="standard" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={createNewAccountType}>Create</Button>
      </DialogActions>
    </Dialog>
  </>
}

export default NewAccountType