import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useState } from "react"
import api from "../../components/fnApi"
import { enqueueSnackbar, useSnackbar } from "notistack"
import * as Passwordless from "@passwordlessdev/passwordless-client"


const NewPasskeyDialog = ({onComplete})=>{
    const [show,setShow] = useState(false)
    const [name,setName] = useState("")
    const toast = useSnackbar()
    const [loading, setLoading] = useState(false)

    const createToken = ()=>{
        setLoading(true)
        api.post("/auth/fido/create", {alias : name}, {ignore401:true})
            .then(async res=>{
                let registerToken = res.data.token 
                const passwordless = new Passwordless.Client({
                    apiUrl: window.webConfig.fido.apiUrl,
                    apiKey: window.webConfig.fido.publicKey
                });

                // credentialNickname is a name you can attach to the passkey - can be any string value
                const credentialNickname = name;
                const finalResponse = await passwordless.register(registerToken, credentialNickname);
                setName("")
                setShow(false)
                onComplete && onComplete(finalResponse.token)
            }).catch((err)=>{
                enqueueSnackbar(err.message, { variant: 'error' })
            }).finally(()=>
                setLoading(false)
            )

    }


    return <>
        <Button variant="outlined" onClick={()=>setShow(true)}>Add Credentials</Button>
        <Dialog open={show} onClose={()=>setShow(false)}>
            <DialogTitle>
                <Typography variant="body2">Passkey Nickname</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2"></Typography>
                <TextField value={name} onChange={(evt)=>setName(evt.target.value)}/>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={createToken} disabled={loading}>Create Passkey</Button>
            </DialogActions>
        </Dialog>
    </>
}

export default NewPasskeyDialog