import { ImageSearch, Satellite } from "@mui/icons-material"
import { Box, Button, Dialog, DialogContent, Divider, Grid2 as Grid, IconButton, List, ListItem, ListItemText, Skeleton, Stack, TextField, Typography } from "@mui/material"
import { cloneElement, useEffect, useState } from "react"
import db from "../../components/LocalDb"
import api from "../../components/fnApi"
import numeral from "numeral"
import { useMutateBlobFile } from "../../repositories/files"

interface EditAiDataProps {
    data: any,
    setData: (data)=>void,
    id: string,
    reviewed: boolean,
    children?: JSX.Element
}


const EditAiData = ({data, setData, id,reviewed, children}:EditAiDataProps)=>{
    const [state,setState] = useState<any>(data || {})
    const [open,setOpen] = useState(false)
    const [loading,setLoading] = useState(true)
    const [image,setImage] = useState("")
    const useFileMutate = useMutateBlobFile()


    useEffect(()=>{
        if(!open) return;
         (async ()=>{
            var output = await db.images.where("id").equals(id).first();
            if(!output) {
                output = await api(`/file/${id}`, {
                    responseType: 'arraybuffer'
                  }).then(async (resp)=>{

                    return new Promise((result)=>{
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                        // reader.result will contain the data URL (e.g., "data:image/jpeg;base64,...")
                            var item = {
                                id:id,
                                data: reader.result as string
                            }
                            await db.images.put(item)
                            setImage(reader.result);
                            result(item)
                        };
                                        
                        reader.readAsDataURL(new Blob([resp.data]));
                    })
                                
            
                }).catch(async (err)=>{
                    if(err.response.status == "404"){
                            var item = {
                                id:id,
                                data: "404" as string
                            }
                            await db.images.put(item)
                            setData("404");
                            return (item)
                    }
                })
            }

            setImage(output.data)
            setLoading(false)
        })()

    },[open,data])
    useEffect(()=>{
        setState(data)
    },[data])    
    const onSaveClicked = ()=>{
        useFileMutate.updateAiData.mutateAsync({
            id:id,
            data:state
        }).then(()=>{
            setData(state)
            setOpen(false)
        })
                    
    }



    return <>
        {!!children ? cloneElement(children, {onClick:()=>setOpen(true) }) :
        <IconButton  disabled={!data}>
            <ImageSearch onClick={()=>setOpen(true)} color={!data? "disabled":"inherit"}/>
        </IconButton>}
        <Dialog open={open} maxWidth="md" fullWidth onClose={()=>setOpen(false)}>
                <Box sx={{width:"100%" , minWidth:"40vw"}}>
                    <Grid container >
                        


                        <Grid>
                                            {loading ? <Skeleton variant="rectangular" height="85vh" sx={{width:{sm:"100%", "85vh"}}}/>:
                                            <Box component="img" sx={{maxHeight:"85vh", maxWidth:"100%"}} src={image || ""}></Box>}
                        </Grid>
                        <Grid sx={{flexGrow:2}}>
                            <List dense>
                                <ListItem>
                                    <TextField fullWidth value={state?.app} label="App" onChange={(evt)=>setState({...state,app:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={<Typography variant="caption">Sender</Typography>}></ListItemText>
                                    
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.senderBank || ""} label="Bank" onChange={(evt)=>setState({...state,senderBank:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.senderName || ""} label="Name" onChange={(evt)=>setState({...state,senderName:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.senderAcct || ""} label="Acct #  " onChange={(evt)=>setState({...state,senderAcct:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={<Typography variant="caption">Recipient</Typography>}></ListItemText>
                                    
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.recipientBank || ""} label="Bank" onChange={(evt)=>setState({...state,recipientBank:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.recipientName || ""} label="Name" onChange={(evt)=>setState({...state,recipientName:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.recipientAcct || ""} label="Acct #  " onChange={(evt)=>setState({...state,recipientAcct:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={<Typography variant="caption">Transaction</Typography>}></ListItemText>
                                    
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={state?.reference || ""} label="Reference" onChange={(evt)=>setState({...state,reference:evt.target.value})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={numeral(state?.transactionFee || 0).format("0,0.00")} label="Trans.Fee" onChange={(evt)=>setState({...state,transactionFee:numeral(evt.target.value).value()})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <TextField fullWidth value={numeral(state?.amount || 0).format("0,0.00")} label="Amount" onChange={(evt)=>setState({...state,amount:numeral(evt.target.value).value()})} size="small"/>
                                </ListItem>
                                <ListItem>
                                    <Button variant="contained" onClick={onSaveClicked} fullWidth> Save </Button>
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Box>
        </Dialog>
    </>
}

export default EditAiData