import { Notifications } from "@mui/icons-material";
import {Avatar, Box, IconButton } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";


const UserPanel = ()=>{
    
    const navigate = useNavigate()
    
    
    
    return (
        <Box display="flex">
            <Box sx={{px:2}}>
                <IconButton onClick={()=>navigate("/notifications")}>
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