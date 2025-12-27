import { Email } from "@mui/icons-material"
import { Box, Dialog, DialogContent, Divider, FormControl, Grid, Grid2, ListItemButton, ListItemIcon, ListItemText, Stack, TextField } from "@mui/material"
import React, { useEffect, useMemo } from "react"
import { useState } from "react"
import sanitizeHtml from 'sanitize-html'



const HtmlDialog = ({data,children})=>{
    const [show,setShow] = useState(false)
    const [full,setFull] = useState(false)

    console.log(sanitizeHtml.defaults, sanitizeHtml.defaults.allowedTags.filter(e=>e != "a").concat(["img","tr"]))
    const sanitizedContent = useMemo(()=>sanitizeHtml(data?.html_content || "", {
        allowedTags : sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: ["style"],
            tr:["style"],
            td:["style","bgcolor","align"],
            div:["style"],
            table:["style","width"]
        }
    }), [data?.html_content]) 


    return <>
        {
            !children?
            <>
            <ListItemButton  onClick={()=>setShow(true)}>
                    <ListItemIcon>
                            <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Email" />
            </ListItemButton>
            <Divider />
            </>:
            React.cloneElement(children, {onClick: ()=>setShow(true)})
        }<Dialog open={show} fullScreen={full} maxWidth="lg" fullWidth  onClose={()=>setShow(false)}>
        <DialogContent>
            <Grid2>
                <Grid2 sx={{p:1}} size={{xs:12,md:6}}>
                    <TextField value={data?.subject} fullWidth size="small"/>
                </Grid2>
                <Grid2 sx={{p:1}} size={{xs:12,md:6}}>
                    <TextField value={data?.sender} fullWidth size="small"/>
                </Grid2>
                <Grid2 sx={{p:1, justifyContent:"center"}} size={{xs:12,md:6}}>
                    <Grid2>
                        <FormControl component="div" dangerouslySetInnerHTML={{__html:sanitizedContent}}>
                        </FormControl>
                    </Grid2>
                </Grid2>
            </Grid2>
        </DialogContent>
    </Dialog>
    </>

}

export default HtmlDialog