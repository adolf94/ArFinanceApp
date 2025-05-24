import { ArrowDownward,  Attachment, Event, CheckCircle,  AccountBalanceWalletRounded, QrCode2, AccountBalance, Check, CheckCircleOutlined, AssignmentTurnedInOutlined, ArrowCircleLeft, Paid, RequestQuote, AccountCircle, AccountBox, Clear, ExpandMore, ExpandLess, Task, Refresh } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary,  Grid,  Typography,List,  ListItem, ListItemText, ListItemIcon, Tooltip, Divider, Chip,  Button, Stack, IconButton, CircularProgress, Box, Skeleton, Menu, MenuItem, ClickAwayListener } from "@mui/material"
import LayerIcon from "../../common/LayerIcon";
import { lazy, Suspense, useEffect, useState } from "react";
import selectionByHook, { getReferenceName } from "./selectionByHook";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { mutateHookMessages } from "../../repositories/hookMessages";
import api from "../../components/api";
import { confirm } from "material-ui-confirm";
import db from "../../components/LocalDb";
const HooksTransaction = lazy(()=>import('./HooksTransaction'))

const camelToSpace = (str:string)=>{
    return str.replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); })
}


const Icons = { 
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


const DeleteLoading = ({onCommit, seconds})=>{
    const [enabled, setEnabled] = useState(false)
    const [value, setValue] = useState(0)
    const [endTime, setEndTime] = useState(null)
    const [timer, setTimer] = useState(null)


    const onInitialize = ()=>{
        const end = moment().add(seconds, "seconds")
        setEndTime(end)
        setEnabled(true)
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
        clearInterval(timer)
        setEnabled(false)
        setValue(0)
    }

    
    return <IconButton onClick={()=>enabled?onCancel(): onInitialize()}>{enabled ? <Tooltip title="Cancel">
            <CircularProgress variant={value >= 100? "indeterminate" : "determinate"} value={value} sx={{width:"20px!important", height:"20px!important"}}/>
        </Tooltip>
        : <Clear />}
        </IconButton>

}


const HooksAccordion = ({notif, onDelete }) => {


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
            api.delete(`/hookmessages/${notif.id}/reprocess`)
                .then(e=>{
                    db.hookMessages.put(e.data)
                    db.hookMessages.delete(notif.id)
                })
        })

    }

    const hide = ()=>{
        setAnchor(null)
    }


    return <>
        <Accordion  slotProps={{ transition: { unmountOnExit: true } }} expanded={expanded} onChange={()=>setExpanded(!expanded)}>
            <Grid container sx={{justifyContent:'space-between'}}>
                <Grid  sm={11} sx={{width:'auto'}}>
                    <AccordionSummary
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >

                            <Stack>
                                <Typography component="span"> {notif.transactionId && <Task color="success"/>} { notif.rawMsg} </Typography>
                                <Typography component="span" sx={{fontSize:'0.75rem', color:'grey'}} >{moment(notif.date).fromNow()}</Typography>

                            </Stack>
                    </AccordionSummary>
                </Grid>
                <Grid sm={1} sx={{shrink:1, textAlign:'right'}}>
                    {notif.transactionId ? <Box  sx={{display:'inline-flex', position:'relative', padding:1, top:"8px"}}><Task color="success"/></Box> : <DeleteLoading onCommit={()=>deleteHook.mutateAsync()} seconds={5}></DeleteLoading>}
                    {/* <IconButton onClick={()=>setExpanded(!expanded)}>
                        {expanded?<ExpandLess />:<ExpandMore/>}
                    </IconButton> */}
                    <IconButton onClick={(evt)=>setAnchor(evt.target)}>
                        <ExpandMore />
                    </IconButton>
                    <Menu anchorEl={anchor} open={showMenu}>
                        <ClickAwayListener onClickAway={hide}>
                            <MenuItem disabled={!!notif.transactionId} onClick={reprocess}>Reprocess</MenuItem>
                        </ClickAwayListener>
                    </Menu>
                </Grid>
            </Grid>
            <AccordionDetails>
                <Grid container sx={{alignItems:'start'}}>
                    <Grid md={6}>
                        <List>
                                
                                {
                                notif.extractedData && Object.keys(notif.extractedData).map((key:string)=>{
                                        if(!notif.extractedData[key]) return "";
                                        if(Icons.hasOwnProperty(key)){
                                                        
                                            return <><ListItem>
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
                                            </>    
                                        }else{            
                                            return <ListItem>
                                                <ListItemIcon>
                                                    <Tooltip title={camelToSpace(key)}>
                                                        <Attachment />
                                                    </Tooltip>
                                                </ListItemIcon>
                                                <ListItemText primary={notif.extractedData[key]} />
                                            </ListItem>   

                                        }
                                    })
                                }

                        </List>
                    </Grid>
                    <Grid container md={6} sx={{justifyContent:"flex-start"}}>
                        <Suspense fallback={<Skeleton fullWidth height="4rem"/>}>
                            <HooksTransaction hook={notif} />
                        </Suspense>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        </>
}


export default HooksAccordion