import {DialogTitle, Dialog, Typography,  DialogContent, Grid2 as Grid, ButtonGroup, Button } from "@mui/material"
import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"


const NewEntry = ({children} : {children:any})=>{
    
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    
    const onClose = () => {
        
        
        
    }
    
    
    return <>
        { React.cloneElement( children, { onClick: ()=>setOpen(true) } ) }

        <Dialog open={!!open} onClose={onClose}>
            <DialogTitle>
                <Typography variant="body1">Add Entry</Typography>
            </DialogTitle>
            <DialogContent>
                <Grid container sx={{pt:1}} spacing={2}>
                    <Grid container size={12} sx={{justifyContent:'center'}}>
                        <ButtonGroup variant="contained">
                            <Button>Transfer</Button>
                            <Button>Expense</Button>
                            <Button>Income</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    </>
}


export default NewEntry