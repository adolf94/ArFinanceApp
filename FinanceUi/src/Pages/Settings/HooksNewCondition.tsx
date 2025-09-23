import { Dialog, DialogActions, DialogContent, Grid2 as Grid, MenuItem, Select, TextField, Button } from "@mui/material"
import { useEffect, useState } from "react"
import { useHooksSettingsState } from "./Hooks"
import allowedProperties from './allowedProperties.json'


interface HooksNewCondition {
    item? : any ,
    isNew: boolean,
    onChange: (newValue)=>void
}


const defaultCondition = {"notif_":{
    operation:"equals",
    property:"",
    value:""
}, "sms_":{
    operation:"equals",
    property:"",
    value:""
},"imgai_":{
    operation:"equals",
    property:"",
    value:""
}, "img_":{
    hasLine:""
}}

const HooksNewCondition = ({item, isNew, onChange} : HooksNewCondition)=>{
    const [show,setShow] = useState(false)
    const tabState = useHooksSettingsState()
    const [form,setForm] = useState(defaultCondition[tabState.tab])


    useEffect(()=>{
        setForm(item || defaultCondition[tabState.tab])
    },[item])

    const handleSave = ()=>{
        onChange(form)
        setForm(defaultCondition[tabState.tab])
        setShow(false)
    }


    return <>
        <Button size="small" onClick={()=>setShow(true)}>Add</Button>
        <Dialog open={show} maxWidth="sm" fullWidth onClose={()=>setShow(false)}>
            <DialogContent>

                { tabState.tab == "imgai_" ? <Grid container>
                    <Grid size={{md:4}}>
                        <Select size="small" fullWidth value={form.property} onChange={(evt)=>setForm({...form, property:evt.target.value})}>
                            {allowedProperties.map(p=> <MenuItem value={p}>{p}</MenuItem>)}
                        </Select>
                    </Grid>
                    <Grid size={{md:3}} sx={{px:1}}>
                        <Select size="small" fullWidth value={form.operation} onChange={(evt)=>setForm({...form, operation:evt.target.value})}>
                            <MenuItem value="equals">equals</MenuItem>
                        </Select>
                    </Grid>
                    <Grid size={{md:5}}>
                            <TextField value={form.value} onChange={(evt)=>setForm({...form, value:evt.target.value})} fullWidth size="small"/>
                    </Grid>
                </Grid> 
                :tabState.tab == "img_" ? <Grid container>
                    <Grid size={{md:3}}>
                        <TextField value="Image" fullWidth disabled size="small"/>
                    </Grid>
                    <Grid size={{md:3}}>
                        <TextField value="hasLine" fullWidth disabled size="small"/>
                    </Grid>
                    <Grid size={{md:6}}>
                        <TextField value={form.hasLine} onChange={(evt)=>setForm({...form, hasLine:evt.target.value})} fullWidth size="small"/>
                    </Grid>
                    
                    </Grid>  : <Grid container>
                    <Grid size={{md:4}}>
                        <Select size="small" fullWidth value={form.property} onChange={(evt)=>setForm({...form, property:evt.target.value})}>
                                <MenuItem value="notif_title">notif_title</MenuItem>
                                <MenuItem value="notif_text">notif_text</MenuItem>
                        </Select>
                    </Grid>
                    <Grid size={{md:3}} sx={{px:1}}>
                        <Select size="small" fullWidth value={form.operation} onChange={(evt)=>setForm({...form, operation:evt.target.value})}>
                            <MenuItem value="equals">equals</MenuItem>
                        </Select>
                    </Grid>
                    <Grid size={{md:5}}>
                        <TextField value={form.value} onChange={(evt)=>setForm({...form, value:evt.target.value})} fullWidth size="small"/>
                    </Grid>
                </Grid>}

                
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="success" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    </>
}

export default HooksNewCondition