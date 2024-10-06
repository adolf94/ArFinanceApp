import { Dialog, DialogTitle, DialogContent, Box, Grid2 as Grid, TextField, DialogActions, Button } from "@mui/material"
import { DisbursementAccount, User } from "FinanceApi"
import React, { useState } from "react"
import { useMutateUser } from "../../repositories/users"
import { enqueueSnackbar } from "notistack"



interface CreateDisbursementAccount {
  user : User,
  show?: boolean,
  onComplete: (acct : DisbursementAccount)=>void,
  onClose:()=>void
}

const CreateDisbursementAccount = (props : CreateDisbursementAccount)=>{
    const [form, setForm] = useState({
      bankName : '',
      accountName: '',
      accountId: ''
    })
    const {addDisbursement} = useMutateUser(props.user.id)

    const create = ()=>{
        if(!form.bankName || !form.accountId) {
          enqueueSnackbar("Fill up the required fields!", {variant:'error'})
          return
        }
        addDisbursement.mutateAsync(form)
          .then(()=>{
            enqueueSnackbar("Added Disbursement Account", {variant:'success'})

            props.onComplete(form)
            props.onClose()
          })
    }



    return <React.Fragment>
      
    <Dialog open={true} maxWidth="sm" fullWidth> 
        <DialogTitle>Create new User</DialogTitle>
        <DialogContent>
            <Box sx={{ width: '100%'}}>
              <Grid container sx={{ p: 1 }}>
                <Grid size={12} sx={{ p: 1 } }>
                  <TextField label="Account For" fullWidth value={props.user?.name} />
                </Grid>
                <Grid size={12} sx={{ p: 1 } }>
                  <TextField label="Bank Name" fullWidth value={form.bankName} onChange={(evt) => setForm({ ...form, bankName: evt.target.value })} />
                </Grid>
                <Grid size={12} sx={{ p: 1 } }>
                  <TextField label="Account Id" fullWidth value={form.accountId} onChange={(evt) => setForm({ ...form, accountId: evt.target.value })} />
                </Grid>
                <Grid size={12} sx={{ p: 1 } }>
                  <TextField label="Account Name (optional)" fullWidth value={form.accountName} onChange={(evt) => setForm({ ...form, accountName: evt.target.value })} />
                </Grid>
              </Grid>
            </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={create}>Create</Button>
          <Button variant="outlined" onClick={()=>props.onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
    </React.Fragment>
            
                        
}

export default CreateDisbursementAccount