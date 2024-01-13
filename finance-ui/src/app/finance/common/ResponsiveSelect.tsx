import { Button, Dialog, FormControl, InputLabel, MenuItem, Paper, Select,  SelectProps,  useMediaQuery, useTheme } from "@mui/material"
import { useState } from "react";


interface ResponsiveSelectProps<T = any> extends SelectProps{
  options: Array<T>,
  getOptionValue: (opt : T) => any, 
  getOptionLabel: (opt: T) => string,
  onChange: (opt : T)=>void,
  placeholder?: string,
  value:T
}


const ResponsiveSelect = (props: ResponsiveSelectProps<any>) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {value, onChange, options, getOptionValue, placeholder, getOptionLabel } = props
  const [open, setOpen] = useState(false)

  const onChangeInternal = (evt: PointerEvent) => {
    let selected = options.find(opt => getOptionValue(opt).toString() == evt?.target?.value)
    
    onChange(selected)
  }


  const onChangePopout = (opt) => {
    console.log(opt)
    onChange(opt)

    setOpen(false)

  }

 return <div>
   <FormControl sx={{ m: 1, minWidth: 120 }} variant={props.variant} fullWidth={props.fullWidth}>
     {placeholder && <InputLabel sx={{ backgroundColor: 'white', px: 1 }} shrink={!!value} id="demo-controlled-open-select-label">{placeholder}</InputLabel>}
      <Select
       {...props}
       open={open && !isMobile}
       onClose={() => setOpen(false)}
       onOpen={() => setOpen(true)}
       value={value ? getOptionValue(value)?.toString() : ""}
       label={placeholder}
       onChange={e=>e.preventDefault() }
      >
       {
         options.map((opt) => <MenuItem key={getOptionValue(opt).toString()} value={getOptionValue(opt).toString()} onClick={() => onChangePopout(opt)}>
           { getOptionLabel(opt)}
         </MenuItem>)
       }
      </Select>
   </FormControl>
   <Dialog open={open && isMobile}>
     <Paper sx={{ p: 2 }}>
     {
       options.map((opt) => <MenuItem key={getOptionValue(opt).toString()} value={getOptionValue(opt).toString()} onClick={() => onChangePopout(opt)}>
         {getOptionLabel(opt)}
       </MenuItem>)
       }
     </Paper>
   </Dialog>
  </div>
}

export default ResponsiveSelect