import { MoreHoriz } from "@mui/icons-material";
import { Tabs , Tab, Menu, MenuItem} from "@mui/material"
import { useState } from "react"
import {pages} from "./AdminBody";


interface SmallTabsProps {
    onChange : (newValue :any)=>void,
    value : any
    
}

const SmallTab  = ({value, onChange} :SmallTabsProps)=>{
    const [anchorEl, setAnchorEl] = useState<any>(null)
    const open = !!anchorEl

    const handleClick = (item : any)=>{
        setAnchorEl(null);
        onChange(item)
    }

    return <><Tabs
            value={value?.value}
            onChange={(_, value)=>{}}
            textColor="secondary"
            indicatorColor="secondary"
            aria-label="secondary tabs example"
        >
            <Tab value={value?.value} label={value?.label} />
            <Tab value="..." label={<MoreHoriz size="large"/>} onClick={(evt)=>setAnchorEl(evt.currentTarget)}/>
        </Tabs>
        <Menu open={open}
              onClose={()=>setAnchorEl(null)}
              anchorEl={anchorEl}
        >
            {pages.map(e=><MenuItem onClick={()=>handleClick(e)}>{e.label}</MenuItem>)}
        </Menu>
    </>
    
     
    
    
}

export default SmallTab