import { Notifications } from "@mui/icons-material";
import {Avatar, Box, IconButton } from "@mui/material";


const UserPanel = ()=>{
    
    
    
    
    
    return (
        <Box display="flex">
            <Box sx={{px:2}}>
                <IconButton >
                    <Notifications />
                </IconButton>
            </Box>
            <Box>
                <Avatar>A</Avatar>
            </Box>
        </Box>
        
        
    )
}

export default UserPanel;