import { Dialog, DialogActions, DialogContent, Grid2 as Grid, MenuItem, Select, TextField, Button, List, IconButton, ListItemText, ListItem, ListItemButton, ListItemIcon, Checkbox, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import getCaptureGroupRanges from "../../common/getCaptureGroupRanges"
import RegexPinpointer from "./RegexPinpointer"
import { Edit } from "@mui/icons-material"
import { useHooksSettingsState } from "./Hooks"
import allowedProperties from './allowedProperties.json' with {type:"json"}


const RegexPropertyMapperListItem = ({index,onMouseOver, onMouseLeave, value, onChange})=>{


    return <ListItem dense disablePadding
    disableGutters
    onMouseOver={()=>{
        onMouseOver()

    }}
    onMouseLeave={()=>onMouseLeave()}
        // secondaryAction={
        //     <IconButton >
        //         <Edit/>
        //     </IconButton>}
    >
            <ListItemIcon >
                {index}
            </ListItemIcon>
            <ListItemText 
                onMouseOver={()=>onMouseOver()}
                onMouseLeave={()=>onMouseLeave()}>
                <Select fullWidth size="small" value={value} onChange={(evt)=>onChange(evt.target.value)}>
                    <MenuItem value="">(ignored)</MenuItem>
                    {allowedProperties.map(e=><MenuItem key={e} value={e}>{e}</MenuItem>)}
                    
                </Select>
            </ListItemText>
    </ListItem>
}

interface HooksRegexPropertiesProps {
    regex : string,
    currentProperties : any[],
    onSave : (newData)=>void
}


const HooksRegexProperties = ({regex, currentProperties, onSave}:HooksRegexPropertiesProps)=>{
    const [show,setShow] = useState(false)
    const HooksSettings = useHooksSettingsState()
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [properties,setProperties] = useState({})
    const [form,setForm] = useState({
        property: "",
        regexIndex: "" 
    })


    

    const groups = useMemo(()=>{
        let captureGroupRanges = getCaptureGroupRanges(regex)
        captureGroupRanges = captureGroupRanges.filter(range => {
            return !(range.start === 0 && range.end === regex.length - 1);
        });

        return captureGroupRanges
    },[regex])

    useEffect(()=>{
        if(!show) return
        let val = groups.reduce((p,c,i)=>{
            let foundProp = currentProperties.find(e=>c.matchIndex == e.regexIndex)
            p[c.matchIndex] = foundProp?.property || ""
            return p
        },{})
        setProperties(val)
    
    },[show, groups])


    const handleSave = ()=>{
        let data = Object.keys(properties)
            .reduce((p,c,i)=>{
                if(!!properties[c]) p.push({
                    
                    regexIndex:Number.parseInt(c),
                    property: properties[c]
                })
                return p
            },[])
            onSave(data)
            setShow(false)
    }

    return <>

        <Button size="small" onClick={()=>setShow(true)}>Edit</Button>
        <Dialog open={show} maxWidth="sm" fullWidth onClose={()=>setShow(false)}>
            <DialogContent>
                <Grid container>
                    <Grid size={{md:12}}>
                        <RegexPinpointer regexString={regex} selectedIndex={hoveredIndex} />
                    </Grid>
                  
                    <Grid size={{md:12}}>
                        <List dense>
                            {groups.map(e=><RegexPropertyMapperListItem key={e.matchIndex} 
                                value={properties[e.matchIndex] || ""}
                                index={e.matchIndex}
                                onChange={(newValue)=>setProperties({...properties, [e.matchIndex]: newValue})}    
                                onMouseOver={()=>setHoveredIndex(e.matchIndex)} 
                                onMouseLeave={()=>setHoveredIndex(null)} />) }
                        </List>
                    </Grid>
                    
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" color="success" onClick={handleSave}>Save</Button>
                <Button  onClick={()=>setShow(false)}>Cancel</Button>
            </DialogActions>
        </Dialog>
    
    </>
  }


  export default HooksRegexProperties