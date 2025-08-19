import { RoomPreferencesSharp } from "@mui/icons-material"
import { Checkbox, InputAdornment, TextField, TextFieldProps } from "@mui/material"
import { Variant } from "@mui/material/styles/createTypography"
import { useState } from "react"


interface TextFieldWithAdornmentLabelProps {
    hasCheckbox? : boolean,
    value : string | null
}

const TextFieldWithAdornmentLabel = (props : TextFieldWithAdornmentLabelProps & TextFieldProps)=>{
    const [stgValue,setValue] = useState<string | null>(props.value)


    return <TextField {...props}
    value={(props.value === null || props.value === undefined) ? "" : props.value}
    onChange={(evt)=>{
        setValue(evt.target.value)
        props.onChange({...evt, target : {...evt.target, value: (props.hasCheckbox && evt.target.value === "") ? null :evt.target.value }})
    }}
    label=""
    slotProps={{
        ...props.slotProps,
        input: {
            startAdornment:<InputAdornment position="start">{props.label}</InputAdornment>,
            endAdornment: !props.hasCheckbox ? null : <InputAdornment position="end"><Checkbox checked={props.value !== null && props.value !==undefined && props.value !== ""} size="small" onChange={(evt)=>{
                if(evt.target.checked){
                    props.onChange({...evt, target : {...evt.target, value: stgValue}})
                }else{
                    props.onChange({...evt, target : {...evt.target, value: null}})
                }
            
        }}/></InputAdornment>
    }}}
/>
}

export default TextFieldWithAdornmentLabel