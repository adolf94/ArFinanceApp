import { ArrowDownward,  Attachment, Event, CheckCircle,  AccountBalanceWalletRounded, QrCode2, AccountBalance, Check, CheckCircleOutlined, AssignmentTurnedInOutlined, ArrowCircleLeft, Paid, RequestQuote, AccountCircle, AccountBox, Clear, ExpandMore, ExpandLess, Task, Refresh, PriceCheck, InfoOutlined } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary,  Grid2 as Grid,  Typography,List,  ListItem, ListItemText, ListItemIcon, Tooltip, Divider, Chip,  Button, Stack, IconButton, CircularProgress, Box, Skeleton, Menu, MenuItem, ClickAwayListener } from "@mui/material"
import LayerIcon from "../../common/LayerIcon";
import { lazy, Suspense, useEffect, useState } from "react";
import selectionByHook, { getReferenceName } from "./selectionByHook";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { mutateHookMessages } from "../../repositories/hookMessages";
import { confirm } from "material-ui-confirm";
import db from "../../components/LocalDb";
import React from "react";
import fnApi from "../../components/fnApi";
import ImageModal from "./ImageModal";
import EditAiData from "../Gallery/EditAiData";
import HtmlDialog from "./HtmlModal";
const HooksTransaction = lazy(()=>import('./HooksTransaction'))

const camelToSpace = (str:string)=>{
    return str.replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); })
}

export const Icons = { 
    "matchedConfig" : {
        icon: <AssignmentTurnedInOutlined  color="primary"/>,
    },
    "success":{
        icon: <CheckCircle  color="primary" />
    },
    "dateTime":{
        icon: <Event  color="primary"/>
    },
    "newBalance":{
        icon: <AccountBalanceWalletRounded  color="primary"/>
    },
    "reference":{
        icon: <QrCode2  color="primary"/>
    },
    "amount":{
        icon: <Paid  color="primary"/>
    },
    "sourceFilename":{
        icon: <Attachment  color="primary"/>
    },
    "transactionFee": {
        icon: <PriceCheck color="primary"/>
    },
    "senderBank":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBalance color="primary"/>
        </LayerIcon>
    },
    "senderAcct":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <RequestQuote color="primary"/>
        </LayerIcon>
    },
    "senderName":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBox color="primary"/>
        </LayerIcon>
    },
    "recipientBank":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'-45deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBalance color="primary"/>
        </LayerIcon>
    },
    "recipientAcct":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'-45deg'}} color="primary" fontSize="0.25rem"/>}>
            <RequestQuote color="primary"/>
        </LayerIcon>
    },
    "recipientName":{
        icon:<LayerIcon bottomIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'-45deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBox color="primary"/>
        </LayerIcon>
    }
}


const DeleteLoading = ({onCommit,onClick, onCancel : propsCancel, seconds})=>{
    const [enabled, setEnabled] = useState(false)
    const [value, setValue] = useState(0)
    const [endTime, setEndTime] = useState(null)
    const [timer, setTimer] = useState(null)


    const onInitialize = ()=>{
        const end = moment().add(seconds, "seconds")
        setEndTime(end)
        setEnabled(true)
        onClick()
        const timer = setInterval(()=>{
            const remaining = end.diff(moment(), "milliseconds")
            const curValue =  100 - ( remaining * 100 / (seconds * 1000))
            setValue(curValue)
            //ts-ignore
            if(curValue >= 100) {
                clearInterval(timer!)
                onCommit()
            }
        },450)
        setTimer(timer)
    }

    const onCancel = ()=>{
        propsCancel()
        clearInterval(timer)
        setEnabled(false)
        setValue(0)
    }

    
    return <IconButton size="small" onClick={()=>enabled?onCancel(): onInitialize()}>{enabled ? <Tooltip title="Cancel">
            <CircularProgress variant={value >= 100? "indeterminate" : "determinate"} value={value} sx={{width:"20px!important", height:"20px!important"}}/>
        </Tooltip>
        : <Clear />}
        </IconButton>

}


const HooksAccordion = ({notif, onDelete, onCancel }) => {


    const navigate = useNavigate()
    const {deleteHook} = mutateHookMessages(notif.id, notif.monthKey)
    const [anchor,setAnchor] = useState<any>(null)
    const showMenu = !!anchor


    const [expanded, setExpanded] = useState<boolean>(false);

    const reprocess = ()=>{
        hide()
        confirm({
            description:"Are you sure to reprocess this notification?"
        }).then(e=>{
            if(e.confirmed){
                fnApi.delete(`/hookmessages/${notif.id}/reprocess`)
                    .then(e=>{
                        db.hookMessages.put(e.data)
                        db.hookMessages.delete(notif.id)
                    })

            }
        })

    }

    const hide = ()=>{
        setAnchor(null)
    }


    return <>
        <Accordion  slotProps={{ transition: { unmountOnExit: true } }} expanded={expanded} onChange={()=>setExpanded(!expanded)}>
            <Grid container sx={{justifyContent:'space-between'}}>
                <Grid  size={{xs:9,md:10}}>
                    <AccordionSummary
                    >
                            <Stack>
                                <Typography component="span"> {notif.transactionId && <Task color="success"/>} { notif.rawMsg} </Typography>
                                <Typography component="span" sx={{fontSize:'0.75rem', color:'grey'}} >{moment(notif.date).fromNow()}</Typography>
                            </Stack>
                    </AccordionSummary>
                </Grid>
                <Grid size={{xs:3,md:2}} sx={{shrink:1, textAlign:'right'}}>
                    {notif.transactionId ? <Box  sx={{display:'inline-flex', position:'relative', padding:1, top:"8px"}}>
                        <Task color="success"/></Box> : 
                            (notif.extractedData.success == false || notif.extractedData.success.toLowerCase() == "false") && <DeleteLoading onClick={()=>onDelete(notif.id)} onCancel={()=>onCancel(notif.id)} onCommit={()=>{}} seconds={5}></DeleteLoading>}
                
                    <IconButton size="small" onClick={(evt)=>setAnchor(evt.target)}>
                        <ExpandMore />
                    </IconButton>
                        <Menu anchorEl={anchor} open={showMenu}>
                            <ClickAwayListener onClickAway={hide}>
                                <Box>  
                                    <MenuItem onClick={()=> {
                                        navigator.clipboard.writeText(notif.rawMsg)
                                        setAnchor(null)
                                    }}>Copy Message</MenuItem>
                                    <MenuItem disabled={!!notif.transactionId} onClick={reprocess}>Reprocess</MenuItem>
                                    {!!notif.jsonData.imageId && 
                                        <EditAiData data={notif.extractedData} setData={()=>{}} id={notif.jsonData.imageId} reviewed={null}>
                                            <MenuItem>Edit Img Extracted Data</MenuItem>
                                        </EditAiData>}
                                    {(notif.extractedData.success == true || notif.extractedData.success.toLowerCase() == "true") && !notif.transactionId &&
                                        <MenuItem disabled={!!notif.transactionId} onClick={() => {
                                            onDelete(notif.id)
                                            hide();
                                        }}>Delete</MenuItem>
                                    }
                                </Box>
                            </ClickAwayListener>
                        </Menu>
                </Grid>
            </Grid>
            <AccordionDetails>
                <Grid container width="100%" sx={{alignItems:'start'}}>
                    <Grid size={{xs:12,md:6}}>
                        <List>
                                
                                {
                                    !!notif.jsonData.imageId &&  <ImageModal id={notif.jsonData.imageId} />
                                }
                                {
                                    !!notif.jsonData.html_content &&  <HtmlDialog data={notif.jsonData}/>
                                }
                                {
                                notif.extractedData && Object.keys(notif.extractedData).map((key:string)=>{
                                        if(!notif.extractedData[key]) return "";
                                        if(typeof(notif.extractedData[key]) == "object") return "";
                                        if(Icons.hasOwnProperty(key)){
                                                        
                                            return <React.Fragment key={key}><ListItem>
                                                <ListItemIcon>
                                                    <Tooltip title={camelToSpace(key)}>
                                                        {Icons[key].icon}
                                                    </Tooltip>
                                                </ListItemIcon>
                                                {key != "success" || !!notif.transactionId ? <ListItemText primary={notif.extractedData[key]} /> 
                                                    :<ListItemText primary={<>{notif.extractedData[key]} </>} />
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
                                                <ListItemText primary={notif.extractedData[key]} />
                                            </ListItem>   

                                        }
                                    })
                                }
                        </List>
                    </Grid>
                    <Grid container size={{md:6}} sx={{justifyContent:"flex-start"}}>
                        <Suspense fallback={<Skeleton variant="text" height="4rem"/>}>
                            <HooksTransaction hook={notif} shown={expanded} />
                        </Suspense>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        </>
}


export default HooksAccordion