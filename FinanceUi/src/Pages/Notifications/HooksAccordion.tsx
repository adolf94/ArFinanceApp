import { ArrowDownward, ArrowDropDown, AssignmentIndRounded, AssignmentTurnedIn, Attachment, Event, CheckCircle, AccountBalanceRounded, AccountBalanceWalletRounded, QrCode2, AccountBalance, Check, CheckCircleOutlined, AssignmentTurnedInOutlined, ArrowCircleLeft, Paid, RequestQuote, AccountCircle, AccountBox } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary,  Grid, TableCell, TableContainer, TableBody, Table, TableRow, Typography, Stack, TextField, Box, FormControl, Input, OutlinedInput, List,  ListItem, ListItemText, ListItemIcon, Tooltip, Divider, Chip } from "@mui/material"
import LayerIcon from "../../common/LayerIcon";
import { useEffect, useState } from "react";
import configs from './hooksMapping.json';

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
        icon:<LayerIcon bottonIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBalance color="primary"/>
        </LayerIcon>
    },
    "senderAcct":{
        icon:<LayerIcon bottonIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <RequestQuote color="primary"/>
        </LayerIcon>
    },
    "senderName":{
        icon:<LayerIcon bottonIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'135deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBox color="primary"/>
        </LayerIcon>
    },
    "recipientBank":{
        icon:<LayerIcon bottonIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'-45deg'}} color="primary" fontSize="0.25rem"/>}>
            <AccountBalance color="primary"/>
        </LayerIcon>
    },
    "recipientAcct":{
        icon:<LayerIcon bottonIcon={<ArrowCircleLeft sx={{backgroundColor:'white', borderRadius:'8px', rotate:'-45deg'}} color="primary" fontSize="0.25rem"/>}>
            <RequestQuote color="primary"/>
        </LayerIcon>
    }
}
    


const HooksAccordion = ({notif }) => {

    const [confs, setConfs] = useState([])
    const [selected, setSelected] = useState(null)

    useEffect(()=>{
        setConfs(()=>{
            return configs.filter(e=>e.config == notif.extractedData?.matchedConfig )
        })
    },[notif.extractedData?.matchedConfig])


    return <>
        <Accordion>
            <AccordionSummary
                expandIcon={<ArrowDownward />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                    <Typography component="span">{ notif.rawMsg}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container>
                    <Grid md={6}>
                        <List>
                            
                        </List>                  
                        <Table>
                            <TableBody>
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
                                                <ListItemText primary={notif.extractedData[key]} />
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


                                
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid container md={6}>
                        <Grid sm={12} sx={{textAlign:'center'}}>
                            {confs.map(e=><Chip label={e.displayName} color="primary" clickable
                            onClick={()=>setSelected(e)}
                            variant={selected?.subConfig == e.subConfig ? "filled" : "outlined"}></Chip>)}
                        </Grid>
                    </Grid>
                    <Grid>

                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        </>
}


export default HooksAccordion