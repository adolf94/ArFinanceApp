import { Box } from "@mui/material"
import React from "react"


const LayerIcon = React.forwardRef((props:any,ref)=>{

    // display: inline-block;
    // height: 1em;
    // position: relative;
    // text-align: center;
    // vertical-align: -.125em;
    // width: 1em;

    return <Box {...props} ref={ref}>
    <Box sx={{display:'inline-block', height:"1em", width:'1em',
    position:'relative', textAlign:'center', verticalAlign:'-.125em'}}>
        {props.children}
        {!!props.bottomIcon && 
            <Box component="span" sx={{position:'absolute', bottom:'-1rem',right:"-0.75rem"}}>
                {React.cloneElement(props.bottomIcon, {size:'small'})}
            </Box>}
    </Box>
    </Box>

})

export default LayerIcon