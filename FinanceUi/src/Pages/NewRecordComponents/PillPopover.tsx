import { Popover, Typography } from "@mui/material";
import React, { useState } from "react";



 const PillPopover = ({text, children}:{children:React.ReactElement, text:string})=>{

    const [anchorEl,setAnchorEl] = useState()
    const open = !!anchorEl


    return <>
        
        <Popover
            id="mouse-over-popover"
            sx={{ pointerEvents: 'none' }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
            }}
            onClose={()=>setAnchorEl(null)}
            disableRestoreFocus
        >
            <Typography sx={{ p: 1 }}>{text}</Typography>
        </Popover>
        {React.cloneElement(children,{onMouseLeave:()=>setAnchorEl(null), onMouseEnter:(evt)=>setAnchorEl(evt.target)})}
    </>
}

export default PillPopover