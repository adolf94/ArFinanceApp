import { Add, AddCircle, Warning } from "@mui/icons-material"
import { Badge, Box, Button, Chip, Dialog, DialogActions, DialogContent, Grid2 as Grid, InputAdornment, List, ListItem, ListItemButton, ListItemText, MenuItem, Select, TextField, TextFieldProps } from "@mui/material"
import { useEffect, useState } from "react"


const types = {
    "transfer":"Transfer",
    "income": "Income",
    "expense": "Expense"
}

const defaultValue = {
    "default":true,
    "subConfig": "",
    "displayName": "",
    "type": "",
    "vendor": "",
    "credit": "",
    "debit": "",
    "remarks": "",
    "comments": ""
}



const DropdownWithFixed = (props : TextFieldProps & {onChange:(val:string)=>void, properties: any[]})=>{
    const value = props.value as string
    const [isFixed, setIsFixed] = useState(value.substring(0,6)=="fixed|")

    const handleDropdownChange = (evt)=>{
        props.onChange(evt.target.value)
    }

    return !isFixed ? <TextField   
        size="small"
        fullWidth 
        {...props}
        label={props.label} value={value} 
        disabled={props.disabled}
        select onChange={handleDropdownChange}>
        {props.properties.map(e=><MenuItem key={e.property} value={e.property}>{e.property}</MenuItem>)}
        <MenuItem value="fixed|" onClick={(evt)=>{
            evt.preventDefault()
            setIsFixed(true)
            props.onChange("fixed|")
        }}>Fixed</MenuItem>
    </TextField>:<TextField     
    size="small"
    fullWidth 
    {...props}
    value={value.substring(6)}
    disabled={props.disabled}
    onChange={(evt)=>props.onChange(`fixed|${evt.target.value}`)}
    slotProps={{
        input:{
            startAdornment: <InputAdornment position="start"><Chip label="fixed" size="small" onDelete={()=>{
                setIsFixed(false)
                props.onChange("")
            }}/></InputAdornment>
        }
    }}
    />
}

const HookSubConfigModal = (props: any)=>{
    const [show,setShow]= useState(false)
    const [items,setItems]= useState(props.data.subConfigs || [])
    const [currentIndex,setCurrentIndex] = useState(-1)

    useEffect(()=>{
        if(show){
            setItems(props.data.subConfigs || [])
        }
    },[show])


    const form = items[currentIndex] || defaultValue
    const setForm = (newState)=>{
        ///validate newState
        let isInvalid = false
        if(!isInvalid && newState.subConfig == "") isInvalid = true
        if(!isInvalid && items.some((e,i)=>i!=currentIndex && e.subConfig == newState.subConfig)) isInvalid = true
        if(!isInvalid && newState.displayName == "") isInvalid = true
        if(!isInvalid && newState.type == "") isInvalid = true
        if(!isInvalid && newState.debit == "") isInvalid = true
        if(!isInvalid && newState.credit == "") isInvalid = true
        newState.invalid = isInvalid

        let state = [...items]
        state[currentIndex] = newState
        setItems(state)
    }

    const handleNew = ()=>{
        let state = [...items]
        let newLength = state.push({...defaultValue, default:false, invalid:true})
        console.log(newLength)
        setItems(state)
        setCurrentIndex(newLength - 1)
    }

    const handleSave = ()=>{
        if(items.some(e=>e.invalid)) return
        props.onDataChange(items)
        setShow(false)
    }

    return <>
        <Button variant="outlined" color="primary" onClick={()=>setShow(true)}><Badge color="secondary" badgeContent={props.data.subConfigs.length}>Manage SubConfigs</Badge></Button>
        <Dialog open={show} onClose={()=>setShow(false)}>
            <DialogContent>
                <Grid container>
                    <Grid size={4}>
                        <List > 
                            {items.map((e,i)=><ListItemButton dense onClick={()=>setCurrentIndex(i)} selected={i==currentIndex}>
                                <ListItemText sx={{whiteSpace:'no-wrap', overflow: "hidden", textOverflow:'ellipsis'}}
                                primary={<>{e.invalid && <Warning fontSize="0.25rem" color="warning"/>} {e.displayName || "New"}</>} />
                            </ListItemButton>)}
                            <ListItemButton dense  onClick={handleNew}>
                                <Button size="small" startIcon={<AddCircle /> }>Add</Button>
                            </ListItemButton>
                        </List>
                    </Grid>
                    <Grid container size={8} sx={{borderLeft: "solid", borderLeftSize:"1px", p:1, gap:2}}>
                        <Grid size={12}>
                            <TextField disabled={form.default} fullWidth label="Key" size="small" value={form.subConfig} onChange={(evt)=>setForm({...form,subConfig:evt.target.value})} />
                        </Grid>
                        <Grid size={12}>
                            <TextField disabled={form.default} fullWidth label="Display Name" size="small" value={form.displayName} onChange={(evt)=>setForm({...form,displayName:evt.target.value})} />
                        </Grid>
                        <Grid size={12}>
                            <TextField disabled={form.default} label="Type" select fullWidth size="small" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                {Object.keys(types).map(e=><MenuItem key={e} value={e}>{types[e]}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid size={12}>
                            <DropdownWithFixed  disabled={form.default} label="Vendor Source" properties={props.data.properties} value={form.vendor} onChange={(v)=>setForm({...form, vendor:v})}/>
                        </Grid>
                        <Grid size={12}>
                            <DropdownWithFixed  disabled={form.default} label="Debit Source(To)" properties={props.data.properties} value={form.debit} onChange={(v)=>setForm({...form, debit:v})}/>
                        </Grid>
                        <Grid size={12}>
                            <DropdownWithFixed disabled={form.default} label="Credit Source(From)" properties={props.data.properties} value={form.credit} onChange={(v)=>setForm({...form, credit:v})}/>
                        </Grid>
                        <Grid size={12}>
                            <TextField disabled={form.default} fullWidth multiline rows={2} label="Remarks Template" size="small" value={form.remarks} onChange={(v)=>setForm({...form, remarks:v.target.value})} />
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button  disabled={form.default} variant="outlined" onClick={handleSave}>Save</Button>

            </DialogActions>
        </Dialog>
    </>

}
 
export default HookSubConfigModal