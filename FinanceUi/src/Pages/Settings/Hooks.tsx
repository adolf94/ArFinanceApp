import { Edit } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, AppBar, Box, Button, Checkbox, Divider, FormControlLabel, Grid2 as Grid, IconButton, List, ListItem, ListItemButton, ListItemText, Tab, Tabs, TextField, Toolbar, Typography } from "@mui/material"
import { useContext, useEffect, useMemo, useState } from "react"
import { AccordionBody } from "reactstrap"
import HookSettingsAccordion from "./HookSettingsAccordion"
import React from "react"
import { faL } from "@fortawesome/free-solid-svg-icons"
import { getConfigsByType, HOOK_CONFIG, useMutateHookConfig } from "../../repositories/hookConfig"
import { useQuery } from "@tanstack/react-query"
import { useConfirm } from "material-ui-confirm"
import { i } from "mathjs"

const HooksSettingsContextDefaultValue = {
    tab: "notif_"
}
const HooksSettingsContext = React.createContext(HooksSettingsContextDefaultValue)
export const useHooksSettingsState = ()=>{
    const state = useContext(HooksSettingsContext)
    return state
}



const HooksSettings = ()=>{
    const confirm = useConfirm()
    const [context,setContext] = useState(HooksSettingsContextDefaultValue)
    const [newHook,setNewHook] = useState(false)
    const {data:configs,isLoading, isSuccess} = useQuery({
        queryKey: [HOOK_CONFIG, {type:context.tab}],
        queryFn: ()=>getConfigsByType(context.tab)
    })
    
    const {create, update} = useMutateHookConfig()

    const data = (()=>{
        return (configs||[]).sort((a,b)=>a.priorityOrder - b.priorityOrder)
    })()


    const getMaxPriority = ()=>{
        return (data || []).reduce((p,c,i)=>{
            if(p > c.priorityOrder) return p;
            return c.priorityOrder;
        },0)
    }


    const newConfig = (item)=>{
        create.mutateAsync({
            ...item,
            type:context.tab,
            priorityOrder: getMaxPriority() + 256,
            nameKey:`${context.tab}${item.name}`
        }).then(()=>{
            setNewHook(false)
        })
    }


    
    const updateConfig = (item)=>{
        return update.mutateAsync({
            ...item,
            type:context.tab,
            nameKey:`${context.tab}${item.name}`
        })
    }


    const handlePriorityChange = (index, direction)=>{
        let item = data[index]
        let otherItem = data[index + (direction == "up" ? -1 : 1)]

        const newItemPriority = otherItem["priorityOrder"]
        const otherItemPriority = item["priorityOrder"]

        item["priorityOrder"] = newItemPriority
        otherItem["priorityOrder"] = otherItemPriority

        Promise.all([updateConfig(item), updateConfig(otherItem)])

    }

    const onTabChange = async (newValue)=>{
        if(newHook){
            await confirm({
                title : "Discard?", 
                content: "This will discard your current edit.",
                cancellationText: "Cancel",
                confirmationText: "Discard"
            }).then(()=>{
                setContext({...context, tab: newValue})
                setNewHook(false)
            })
        }else {
            setContext({...context, tab: newValue})
        }
    }
        



    return <>
            <AppBar position="static">
                <Toolbar>
                    <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                        Settings
                    </Typography>
                </Toolbar>
            </AppBar>
            <HooksSettingsContext.Provider value={context} >
            <Box sx={{width:"100%"}}>
                <Grid container sx={{justifyContent:"center"}}>
                    <Grid container size={8}>
                        <Grid container size={12} sx={{justifyContent:"space-between"}}>
                            <Grid>
                                <Tabs value={context.tab} onChange={(_,v)=>onTabChange(v)} variant="scrollable">
                                    <Tab label="Notifications" value="notif_" />
                                    <Tab label="SMS" value="sms_" />
                                    <Tab label="Emails" value="email_" />
                                    <Tab label="Images(AI)" value="imgai_" />
                                    <Tab label="Images" value="img_" />
                                </Tabs>
                            </Grid>
                            <Grid sx={{pt:1}}>
                                <Button onClick={()=>setNewHook(true)}>
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid size={12}>
                                
                                { newHook && <HookSettingsAccordion onSave={newConfig} i={null}  tab={context.tab} onCancel={()=>setNewHook(false)}/>}
                        </Grid>
                        <Grid size={12}>
                                {!isLoading && (data || []).map((e,i)=><HookSettingsAccordion tab={context.tab} key={e.nameKey} i={i} totalItems={data.length} value={e} onSave={updateConfig} onPriorityChange={(d)=>handlePriorityChange(i,d)} />)}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            </HooksSettingsContext.Provider>
         </>
}

export default HooksSettings