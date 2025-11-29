import { Check, CheckCircle, Edit, ExpandLess, ExpandMore,  SwapVert } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, Menu, Button, Checkbox, Divider, FormControlLabel, Grid2 as Grid, IconButton, InputAdornment, List, ListItem, ListItemText,  Tab, TextField, Typography, MenuItem, ClickAwayListener, RadioGroup, Radio } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useHooksSettingsState } from "./Hooks"
import HooksConfigProperty from "./HooksConfigProperty"
import HooksConfigCondition from "./HooksConfigCondition"
import HooksNewCondition from "./HooksNewCondition"
import HooksRegexProperties from "./HooksRegexProperties"
import HooksAddProperty from "./HooksAddProperty"
import allowedProperties from './allowedProperties.json'
import HookSubConfigModal  from "./HookSubConfigModal"
import { electricConstantDependencies } from "mathjs"
const data =  
{
    "name":"notif_gcash_receive",
    "app": "com.globe.gcash.android",
    "regex": "(You have received PHP ([0-9\\.]+) of GCash from ([A-Z\\*\\ \\.]+) ([0-9]*)\\.)",
    "conditions":[{
        "property": "notif_title",
        "operation": "equals",
        "value": "You have received money in GCash!"
    }],
    "properties":[
        {
            "property": "senderName",
            "regexIndex": 2
        },
        {
            "property":"senderAcct",
            "regexIndex": 3
        },
        {
            "property":"amount",
            "regexIndex": 1
        }
    ]

}

interface HookSettingsAccordionProps {
    onCancel?: ()=>void,
    onPriorityChange?: (direction:string)=>void,
    i? : number ,
    totalItems? : number ,
    value?: {
        name:string,
        nameKey:string,
        app:string,
        regex:string,
        displayText:string,
        conditions:any[],
        properties:any[],
        enabled:boolean,
        success:boolean
    } ,
    onSave : (newValue)=>void
}

const defaultValue = {
    name:"",
    nameKey:"",
    app:"",
    regex:"",
    success:true,
    enabled:true,
    conditions:[],
    displayText:"",
    subConfigs:[],
    properties:[]
}


const HookSettingsAccordion = (props : HookSettingsAccordionProps)=>{
    const [expanded,setExpanded] = useState(false)
    const [form,setForm] = useState(props.value || defaultValue)
    const [name,setName] = useState("")
    const [editName,setEditName] = useState(!props.value)
    const settingsState = useHooksSettingsState()
    const [anchor,setAnchor] = useState<any>(null)
    const showMenu = !!anchor
    const [selectedProp,setSelectedProp] = useState("regex")

    useEffect(()=>{
        if(!props.value){
            setForm(defaultValue) 
            setExpanded(false)
        }

    },[settingsState.tab])
    

    const isSubmittable = useMemo(()=>{
        if(!form.name) return false;
        if(!form.app) return false;
        if(!form.success) return true;
        if(!form.regex && ["img_", "imgai_"].indexOf(settingsState.tab) == -1 ) return false;
        if(form.properties.length == 0 && ["imgai_"].indexOf(settingsState.tab) == -1) return false;
        return true
    },[form])


    const handleSave = ()=>{

        props.onSave(form)
        setExpanded(false)
        if(!props.value){
            setForm(defaultValue) 
        }
    }

    useEffect(()=>{
        setSelectedProp("regex")
    },[settingsState.tab])



    const handleNameSave = ()=>{
            setForm({...form, nameKey:`${settingsState.tab}${form.name}`})
            setEditName(false)
            setExpanded(true)
            //add properties
            if(settingsState.tab == "imgai_"){
                setForm({...form, nameKey:`${settingsState.tab}${form.name}`, properties: allowedProperties.map((e)=>({property:e}))})
            }
    }

    const handleMove = (dir)=>{
        props.onPriorityChange(dir)
        setAnchor(null)
    }

    // return  <div ref={setNodeRef}  {...attributes} style={style}> 
    return <Accordion expanded={expanded} >
        {!editName? 
        <Grid container sx={{justifyContent:'space-between'}}>
            <Grid  size={{xs:9,md:10}}>
                <AccordionSummary 
                    onClick={()=>setExpanded((p)=>!p)}
                >


                             <Typography component="span">{form.nameKey}</Typography> 
                             {!props.value && <Edit sx={{fontSize:"12px", pl:1}} onClick={ ()=>{
                                setEditName(true)
                                setExpanded(true)
                             }} />}

                </AccordionSummary>
            </Grid>
            <Grid size={{xs:3,md:2}} sx={{pt:1,shrink:1, textAlign:'right'}}>
                    {props.value && 
                        <ClickAwayListener onClickAway={()=>setAnchor(null)}>
                            <Box component="span">
                                <IconButton size="small" onClick={(evt)=>setAnchor(evt.target)}>
                                        <SwapVert />
                                    </IconButton>
                            </Box>
                        </ClickAwayListener>
                        
                    }
                    <Menu anchorEl={anchor} open={showMenu}>
                        {props.i > 0 && <MenuItem onClick={()=>handleMove("up")}>Move up</MenuItem>}
                        {props.i < props.totalItems - 1 && <MenuItem onClick={()=>handleMove("down")}>Move down</MenuItem>}
                    </Menu>
                <IconButton size="small" onClick={()=>setExpanded((p)=>!p)}>
                    {expanded?<ExpandLess />:<ExpandMore />}
                </IconButton>
            </Grid>
        </Grid> : <AccordionSummary 
                >
                    <TextField value={form.name} autoComplete="off" onChange={evt=>{
                        console.log(evt.target.value)   
                        setForm({...form,name:evt.target.value})
                    }} 
                        size="small" fullWidth
                        onKeyDown={(evt)=>{
                            if(evt.key.toLowerCase() == "enter"){
                                handleNameSave()
                            }
                        }}
                         slotProps={{
                            input: {
                                startAdornment:<InputAdornment position="start">
                                    {settingsState.tab}
                                </InputAdornment>,
                                endAdornment:<InputAdornment position="end">
                                    <IconButton onClick={handleNameSave}>
                                        <Check/>
                                    </IconButton>
                                </InputAdornment>
                            }
                         }}
                    />
                </AccordionSummary>
        
    
    }
        <AccordionDetails>
            <Grid container>
                <Grid size={4}>
                    <TextField label="App" size="small" value={form.app} onChange={evt=>setForm({...form, app:evt.target.value})} fullWidth sx={{pb:1}}/>
                    <FormControlLabel control={<Checkbox defaultChecked checked={form.enabled} onChange={(evt)=>setForm({...form, enabled: evt.target.checked})}/>} label="Enabled" />
                    <FormControlLabel control={<Checkbox defaultChecked  checked={form.success} onChange={(evt)=>setForm({...form, success: evt.target.checked})}/>} label="Success" />
                </Grid>
                <Grid size={8} sx={{pl:1}}>
                    { ["sms_", "notif_"].includes(settingsState.tab) && <>
                        {
                            settingsState.tab == "notif_" && <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={selectedProp}
                                row
                                onChange={evt=>setSelectedProp(evt.target.value)}
                            >
                                <FormControlLabel value="regex" control={<Radio />} label="Content" />
                                <FormControlLabel value="titleRegex" control={<Radio />} label="Title" />
                            </RadioGroup>
                        }
                            <TextField label="Regex" multiline rows={2} size="small"  value={form[selectedProp] || ""} onChange={evt=>setForm({...form, [selectedProp]:evt.target.value})} fullWidth sx={{pb:1}}/>
                        <Divider />
                        </>
                    }
                        <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>

                        <Typography variant="body2">Conditions</Typography>
                            <HooksNewCondition isNew onChange={(item)=>{
                                setForm({...form, conditions:[item, ...form.conditions]})
                            }} />
                        </Box>
                        <Box sx={{px:2, width:'100%'}}>
                            <List dense >
                                {
                                    form.conditions.map((e,i)=><HooksConfigCondition key={`${i}-${e.property}`} item={e} />)
                                }
                            </List>
                        </Box>
                        <Divider />
              
                {
                    settingsState.tab != "imgai_" &&<>
                    <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <Typography variant="body2">Properties</Typography>
                        {
                            settingsState.tab == "img_" ? <HooksAddProperty item={null} onSave={(data)=>{
                                    setForm({...form, properties:[...form.properties,data]})
                                }} isNew/>
                                : <HooksRegexProperties regex={form[selectedProp]} currentProperties={form.properties.filter(e=>(selectedProp == "regex" && !e.for) || e.for==selectedProp)} onSave={(data)=>{
                                    let prev = form.properties
                                    prev = prev.filter(e=>e.for!=selectedProp || (selectedProp != "regex" || !e.for))
                                    setForm({...form, properties:[...prev,...data.map(e=>({...e,for:selectedProp}))]})
                                }}/>
                        }
                        
                    </Box>
                        <Box sx={{ px:2, width:'100%'}}>
                            <List dense >
                                {
                                    form.properties.map((e,i)=>settingsState.tab == "img_" ? <HooksAddProperty key={`${i}-${e.property}`} item={e} onSave={(data)=>{
                                                    setForm((prev)=>{
                                                        let state = {...prev}
                                                        state.properties[i] = data
                                                        return state
                                                    })
                                            }} />
                                        :
                                        (e.for==selectedProp || (selectedProp == "regex" && !e.for)) &&<HooksConfigProperty key={`${i}-${e.property}`} item={e}/>)
                                }
                            </List>
                        </Box>
                        <Divider />
                    </>
                }
                      
                      {/* {settingsState.tab == "img_ai_" && <HookSubConfigModal component="card" data={form} onDataChange={(subConfigs)=>setForm({...form, subConfigs:subConfigs})}/> } */}
                    
                    <Box sx={{ pt:1, pr:2, width:'100%'}}>
                        <TextField label="Display Text" multiline rows={2} size="small"  value={form.displayText} onChange={evt=>setForm({...form, displayText:evt.target.value})} fullWidth sx={{pb:1}}/>
                    </Box>
                </Grid>
            </Grid>
            <Divider />
            <Grid container sx={{justifyContent:"space-between", pt:1}}>
                <Grid>
                    <HookSubConfigModal data={form} onDataChange={(subConfigs)=>setForm({...form, subConfigs:subConfigs})}/>
                </Grid>
                <Grid>
                    <Button variant="outlined" color="success" disabled={!isSubmittable} onClick={()=>handleSave()}>Save</Button>
                    <Button onClick={()=>{
                        setForm(defaultValue) 
                        setExpanded(false)
                        !!props.onCancel && props.onCancel()
                    }}>Cancel</Button>
                </Grid>
            </Grid>
        </AccordionDetails>
        
    </Accordion>
//  </div>
}

export default HookSettingsAccordion