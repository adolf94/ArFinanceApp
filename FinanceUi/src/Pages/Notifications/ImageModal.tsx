import { Box, CircularProgress, Dialog, DialogContent, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import db from "../../components/LocalDb"
import api from "../../components/fnApi"
import {Image} from '@mui/icons-material'


const ImageModal = ({id} : {id:string})=>{
    const [open,setOpen] = useState(false)
    const [data,setData] = useState<string | ArrayBuffer>("")
    
    useEffect(()=>{
        if(!open) return
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
                            setData(reader.result);
                            result(item)
                        };
                                        
                        reader.readAsDataURL(resp.data);
                    })
                                
            
                })
            }

            setData(output.data)
        })()

    },[open])
    

    return <>
        <ListItemButton  onClick={()=>setOpen(true)}>
                <ListItemIcon>
                        <Image />
                </ListItemIcon>
                <ListItemText primary="Image" />
        </ListItemButton>
        <Divider />
        <Dialog open={open} onClose={()=>setOpen(false)}>
            <DialogContent>
                {!data ? <CircularProgress size="3rem"/> :
                    <Box component="img" sx={{maxHeight:"85vh"}} src={data}></Box>
                } 
            </DialogContent>
        </Dialog>
    </>
}
export default ImageModal