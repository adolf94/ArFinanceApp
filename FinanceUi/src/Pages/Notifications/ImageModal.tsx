import { Box, CircularProgress, Dialog, DialogContent, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import db from "../../components/LocalDb"
import api from "../../components/fnApi"
import { Image } from "@mui/icons-material"



const ImageModal = ({id} : {id:string})=>{
    const [open,setOpen] = useState(false)
    const [data,setData] = useState("")
    
    useEffect(()=>{
        if(!open) return
         (async ()=>{
            var output = await db.images.where("id").equals(id).first();
            if(!output) {
                output = await api(`/file/${id}`, {
                    responseType: 'blob'
                }).then(async (res)=>{
                    const imageBlob = res.data;
                    const imageUrl = URL.createObjectURL(imageBlob); // Create a Blob URL
                    var item = {
                        id:id,
                        data: imageUrl
                    }
                    await db.images.put(item)
                    setData(imageUrl);
                    return item
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