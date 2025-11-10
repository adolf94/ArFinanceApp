import { InfoOutlined, Receipt } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, CardContent, Dialog, DialogContent, Divider, IconButton, ListItem, ListItemIcon, ListItemText, Stack, TableBody, TableCell, TableContainer, TableRow, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import db from "../../components/LocalDb"
import { getOneHookMsg } from "../../repositories/hookMessages"
import ImageModal from "../Notifications/ImageModal"
import React from "react"
import { Icons } from "../Notifications/HooksAccordion"


const camelToSpace = (str:string)=>{
  return str.replace(/([A-Z])/g, ' $1')
  .toLowerCase()
  // uppercase the first character
  .replace(/^./, function(str){ return str.toUpperCase(); })
}

const ViewNotif = ({item})=>{
    const [show, setShow] = useState(false)


    return <Accordion>
      <AccordionSummary>
      {item.rawMsg}
      </AccordionSummary>
      <AccordionDetails>
        {!!item.jsonData.imageId &&  <ImageModal id={item.jsonData.imageId} />}
        {
            item.extractedData && Object.keys(item.extractedData).map((key:string)=>{
              if(!item.extractedData[key]) return "";
              if(typeof(item.extractedData[key]) == "object") return "";
              if(Icons.hasOwnProperty(key)){
                              
                  return <React.Fragment key={key}><ListItem>
                      <ListItemIcon>
                          <Tooltip title={camelToSpace(key)}>
                              {Icons[key].icon}
                          </Tooltip>
                      </ListItemIcon>
                      {key != "success" || !!item.transactionId ? <ListItemText primary={item.extractedData[key]} /> 
                          :<ListItemText primary={<>{item.extractedData[key]} </>} />
                      }
                  </ListItem>
                      <Divider />
                  </React.Fragment>    
              }else{            
                  return <ListItem key={key}>
                      <ListItemIcon>
                          <Tooltip title={camelToSpace(key)}>
                              <InfoOutlined />
                          </Tooltip>
                      </ListItemIcon>
                      <ListItemText primary={item.extractedData[key]} />
                  </ListItem>   

              }
            })
        }
      </AccordionDetails>
    </Accordion>
  //   <Card>
  //   <TableContainer>
  //     <TableBody>
  //       <TableRow>
  //         <TableCell sx={{width:"auto", fontWeight:'500'}}>
  //           Description
  //         </TableCell>
  //         <TableCell sx={{width:"80%"}}>
  //           {item.rawMsg}
  //         </TableCell>
  //       </TableRow>
  //       {show && <TableRow>
  //         {
  //                                   !!notif.jsonData.imageId &&  <ImageModal id={notif.jsonData.imageId} />
  //                               }
  //         </TableRow>}
  //     </TableBody>
  //   </TableContainer>
  // </Card>

}


const ViewNotifDialog = ({notifs})=>{
    const [open,setOpen] = useState(false)
    const [hooks, setHooks] = useState([])

    useEffect(()=>{
      (async ()=>{
        if(!notifs || notifs.length == 0) return
        Promise.all(notifs.map(n=>{
            return new Promise(async (res,rej)=>{
              let key = n.split("|")
              let item = await db.hookMessages.where("id").equals(key[1]).first()
              if(!!item) return res(item)
                
              item = await getOneHookMsg(key[1], key[0])
              res(item)
            })
        })).then(d=>setHooks(d))
      })()
    },[notifs])


    return <>
        <IconButton>
            <Receipt onClick={()=>setOpen(true)} color={notifs && notifs?.length > 0 ? "info" : "inherit"}/>
        </IconButton> 
        <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm">
          <DialogContent>
            <Stack gap={1}>
              {hooks.map(h=><ViewNotif item={h} />)}
              
            </Stack>
            <Button fullWidth> Add </Button>
          </DialogContent>
        </Dialog>
    </>
}

export default ViewNotifDialog