import { Warning } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Divider, ListItem, ListItemText, Skeleton, Typography } from "@mui/material"
import { useState } from "react"
import { ErrorBoundary } from "react-error-boundary"



const FallbackComponent = (data)=>{


    const  Fallback = ({ error, resetErrorBoundary } : {error: Error, resetErrorBoundary: any}) => {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

        const [expanded,setExpanded] = useState(false)
        return <>
                <Accordion  slotProps={{ transition: { unmountOnExit: true } }} expanded={expanded} onChange={()=>setExpanded(!expanded)}>
            
                    <AccordionSummary>
                        <Typography component="span"> <Warning color="warning" fontSize="1rem"/> Error with rendering </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>{error.message}</Typography>
                        <Typography component="pre">
                            {
                                JSON.stringify(data, null,2)
                            }
                        </Typography>
                    </AccordionDetails>
                </Accordion>
        </>
    }

    return Fallback

}


const HooksErrorBoundary = ({children, data})=>{


return <ErrorBoundary FallbackComponent={FallbackComponent(data)} onError={(err,info)=>console.error(err,info)}>
    {children}
</ErrorBoundary>
}

export default HooksErrorBoundary