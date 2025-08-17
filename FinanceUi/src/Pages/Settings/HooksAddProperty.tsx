import { Add, Edit, PlusOneRounded, Save } from "@mui/icons-material"
import { IconButton, ListItem, ListItemText, Typography, Button, Dialog, DialogContent, Grid2 as Grid, TextField, MenuItem, Select, InputAdornment, Checkbox, DialogActions } from "@mui/material"
import { useEffect, useState } from "react"
import allowedProperties from './allowedProperties.json'
import TextFieldWithAdornmentLabel from "../../components/TextFieldWithAdornmentLabel"

interface ImagePropertyExtract {
    property: string,
    lookFor: string,
    getValueAfter: Number,
    extractRegex?: string | null,
    getMatch?: Number | null,
    removeRegex: string[]
}
const defaultValue: ImagePropertyExtract  = {
    "property":"",
    "lookFor":"",
    "getValueAfter" : 0,
    "extractRegex":"",
    "getMatch":null,
    "removeRegex": []
}


const ReplaceRegexItem = (({item, isNew, onSave}: {item:any, isNew?:boolean, onSave:(item, action)=>void})=>{
    const [form,setForm] = useState({
        f:"",
        t:""
    })

    const [editing,setEditing] = useState(isNew)

    useEffect(()=>{
        setForm(item || {f:"", t:""})
    },[item])

    const handleSave = ()=>{
        if(editing){
            onSave(form, "update")
            if(!isNew) setEditing(false)
            if(isNew) setForm({f:"", t:""})
        }else{
            setEditing(true)
        }
    }

    return <><Grid size={5}>
    <TextField value={form.f} type="number" onChange={e=>setForm({...form,f:e.target.value})} size="small" fullWidth disabled={!editing}
        slotProps={{input: {
            startAdornment:<InputAdornment position="start">From</InputAdornment>,
        }}}
    />
    </Grid>
    <Grid size={7}>
        <TextField value={form.t} type="number" onChange={e=>setForm({...form,t:e.target.value})} size="small" fullWidth disabled={!editing}
            slotProps={{input: {
                startAdornment:<InputAdornment position="start">To</InputAdornment>,
                endAdornment:<InputAdornment position="end">
                    <IconButton size="small" onClick={handleSave}>
                        {editing? <Save /> : <Edit />}
                    </IconButton>
                </InputAdornment>,
            }}}
        />
    </Grid>
    </>
})


const HooksAddProperty = ({item,isNew, onSave} : {item:any, isNew?:boolean, onSave:(data)=>void}) =>{
    const [show,setShow] = useState(false)
    const [form, setForm] = useState(defaultValue)


    const handleSave = ()=>{
        onSave(form)
        setForm(item || defaultValue)
        setShow(false)
    }

    return isNew ? <>   
        <Button size="small" onClick={()=>setShow(true)}>Add</Button> 
        
        <Dialog open={show} maxWidth="sm" fullWidth onClose={()=>setShow(false)}>
            <DialogContent>
                <Grid container>
                    <Grid size={12}>
                        
                    </Grid>
                    <Grid size={12}>
                        
                        <Select size="small" fullWidth value={form.property} onChange={(evt)=>setForm({...form, property:evt.target.value})}
                            startAdornment={
                                <InputAdornment position="start">
                                    Property:
                                </InputAdornment>
                            }
                            >
                                                {allowedProperties.map(e=><MenuItem key={e} value={e}>{e}</MenuItem>)}
                        </Select>
                    </Grid>
                    <Grid size={12} sx={{pt:1}}>
                        <TextFieldWithAdornmentLabel label="Look For" value={form.lookFor} onChange={e=>setForm({...form,lookFor:e.target.value})}
                             size="small" fullWidth />

                    </Grid>
                    <Grid size={12} sx={{pt:1}}>
                        <TextFieldWithAdornmentLabel label="Get Value After" value={form.getValueAfter.toString()} type="number" onChange={e=>setForm({...form,getValueAfter:Number.parseInt(e.target.value)})} size="small" fullWidth />

                    </Grid>
                    <Grid size={12} sx={{pt:1}}>
                        <TextFieldWithAdornmentLabel hasCheckbox label="Extract Regex" value={form.extractRegex} onChange={e=>setForm({...form,extractRegex:e.target.value})} size="small" fullWidth />
                    </Grid>
                    <Grid size={12} sx={{pt:1}}>
                        <TextFieldWithAdornmentLabel hasCheckbox label="Get Match" value={(form.getMatch || "").toString()} type="number" onChange={e=>setForm({...form,getMatch:Number.parseInt(e.target.value)})} size="small" fullWidth />
                        


                    </Grid>
                    <Grid container size={12}  sx={{pt:1}} >
                        <Grid size={3} sx={{p:1, color:"rgb(0,0,0,0.6)"}}>
                            <Typography variant="body1">Replace Regex:</Typography>
                        </Grid>
                        <Grid container size={9}>
                            {form.removeRegex.map((e,i)=><ReplaceRegexItem item={e} onSave={(item)=>{
                                setForm((prev)=>{
                                    let state = {...prev}
                                    state.removeRegex[i] = item
                                    return state
                                })
                            }}/>)}
                            <ReplaceRegexItem item={null} isNew onSave={(item)=>{
                                setForm({
                                    ...form,
                                    removeRegex:[...form.removeRegex,item]
                                })
                            }}/>
                                
                        </Grid>


                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="success" onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>



    </>: <ListItem dense disablePadding
    secondaryAction={
        <IconButton >
            <Edit/>
        </IconButton>}

>
        <ListItemText>
            <Typography variant="body2"> {item.property} <b>({item.regexIndex})</b></Typography>
        </ListItemText>
</ListItem>
}



export default HooksAddProperty