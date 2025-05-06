import { ArrowDownward,  Attachment, Event, CheckCircle,  AccountBalanceWalletRounded, QrCode2, AccountBalance, Check, CheckCircleOutlined, AssignmentTurnedInOutlined, ArrowCircleLeft, Paid, RequestQuote, AccountCircle, AccountBox } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary,  Grid,  Typography,List,  ListItem, ListItemText, ListItemIcon, Tooltip, Divider, Chip,  Button } from "@mui/material"
import LayerIcon from "../../common/LayerIcon";
import { useEffect, useState } from "react";
import configs from './hooksMapping.json';
import selectionByHook, { getReferenceName } from "./selectionByHook";
import moment from "moment";
import { useNavigate } from "react-router-dom";

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
    }
}
    


const HooksAccordion = ({notif }) => {

    const [confs, setConfs] = useState([])
    const [selected, setSelected] = useState(null)
    const [reference, setReference] = useState({
        vendor:"",
        credit:"",
        debit:""
    })
    const [formData,setFormData] = useState({
        date: null,
        credit: null,
        debit: null,
        vendor:null,
        amount: 0,
        type:""
    })

    const navigate = useNavigate()
    useEffect(()=>{
        setConfs(()=>{
            return configs.filter(e=>e.config == notif.extractedData?.matchedConfig )
        })
    },[notif.extractedData?.matchedConfig])

  useEffect(()=>{
    (async()=>{
      let selectedConfig = selected;
      if(!selectedConfig) return
      let hook = notif
      let amount = hook.extractedData.amount;


      const isCreditRefSameAsVendor = selectedConfig.vendor == selectedConfig.credit
      const isDebitRefSameAsVendor = selectedConfig.vendor == selectedConfig.debit
      let vendor, credit, debit

      let references = {
        vendor : getReferenceName(selectedConfig.vendor, hook),
        credit : getReferenceName(selectedConfig.credit, hook),
        debit : getReferenceName(selectedConfig.debit, hook)
      }



      vendor = (!isCreditRefSameAsVendor&&!isDebitRefSameAsVendor) ?selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
        [ "vendor"]) : null


      let creditVendor = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, 
        [ "account", ...(isCreditRefSameAsVendor?["vendor"]:[]) ])
      
      let debitVendor = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
          [ "account", ...(isDebitRefSameAsVendor?["vendor"]:[]) ])
          

        setReference(reference)

      await creditVendor.then(d=>{
        if(isCreditRefSameAsVendor) {
          [credit, vendor] = d
        } else { [credit] = d}
      })
      
      await debitVendor.then(d=>{
        if(isDebitRefSameAsVendor) {
          [debit, vendor] = d
        } else { [debit] = d}
      })
      // let vendor = selectionByHook(selectedConfig.vendor, hook, selectedConfig.type, "vendor")
      // let credit = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, "account")
      // let debit = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, "account")
      let datetime = moment(hook.date).toISOString();
        setFormData({
          ...formData,
          type:selectedConfig.type,
          date: datetime,
          amount,
          debit,
          credit,
          vendor,
        })

    })()
  }, [selected])

  



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

                        </List>                  
                        </Grid>
                    <Grid container md={6} sx={{justifyContent:"flex-start"}}>
                        <Grid sm={12} sx={{textAlign:'center'}}>
                            {confs.map(e=><Chip label={e.displayName} color="primary" clickable
                            onClick={()=>setSelected(e)}
                            variant={selected?.subConfig == e.subConfig ? "filled" : "outlined"}></Chip>)}
                        </Grid>
                        <Grid item sm={12}>
                            <List>
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}><b>Date:</b> </Grid>
                                            <Grid sm={8}>{formData.date}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}><b>Credit:</b> </Grid>
                                            <Grid sm={8}>{formData.credit?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}><b>Debit:</b> </Grid>
                                            <Grid sm={8}>{formData.debit?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}><b>Vendor:</b> </Grid>
                                            <Grid sm={8}>{formData.vendor?.name}</Grid>
                                        </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}><b>Amount:</b> </Grid>
                                            <Grid sm={8}>{formData.amount}</Grid>
                                            </Grid>} />
                                </ListItem>
                                <Divider />
                                <ListItem>
                                    <ListItemText primary={
                                        <Grid container>
                                            <Grid sm={4}> </Grid>
                                            <Grid sm={8} sx={{alignItems:'right'}}><Button>Submit</Button><Button onClick={()=>navigate(`/transactions/new?hookId=${notif.id}`)}>More</Button></Grid>
                                        </Grid>} />
                                </ListItem>
                            </List>

                        </Grid>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
        </>
}


export default HooksAccordion