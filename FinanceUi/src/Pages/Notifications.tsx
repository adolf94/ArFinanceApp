import { AppBar, Box, Button, Chip, Divider, Grid2 as Grid, IconButton, List, ListItem, ListItemText, Paper, Skeleton, Toolbar, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import UserPanel from "../components/UserPanel.js";
import {getHooksMessages, getHooksMessagesByMonth, HOOK_MESSAGES} from "../repositories/hookMessages.js";
import HooksAccordion from "./Notifications/HooksAccordion.jsx";
import { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Refresh } from "@mui/icons-material";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../components/LocalDb/AppDb.js";
import { queryClient } from "../App.jsx";
import {useDebouncedCallback} from 'use-debounce'
import { mutateHookMessages } from "../repositories/hookMessages";
import {Grid2} from "@mui/material";
import HooksErrorBoundary from "./Notifications/HooksErrorBoundary.jsx";
import { useBottomAppBarSize } from "../components/Layout.jsx";
import { useContainerDimensions } from "../common/useContainerDimensions.js";

import { useVirtualizer } from '@tanstack/react-virtual'
import HtmlDialog from "./Notifications/HtmlModal.jsx";



const Notifications = () => {
    const [params, setParams] = useSearchParams({
        month: moment().format("YYYY-MM-01")
    })
    const forDelete = useRef([])
    const [query,setQuery] = useSearchParams()
    const bottomAppSize = useBottomAppBarSize()
    const topBarRef = useRef()
    const topPartRef = useRef()
    const parentRef = useRef()
    const topBarSize = useContainerDimensions(topBarRef)
    const topPartSize = useContainerDimensions(topPartRef)


    
    const {deleteMany} = mutateHookMessages(0,params.get("month"))
    const {isFetching} = useQuery({
            queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
            queryFn: () => getHooksMessagesByMonth(params.get("month")!),
            gcTime:24*60*60
        })

    const type = (query.get("type") || "sms,notif,image,email").split(",")
    const success = (query.get("matched") || "yes").split(",")



    // const {data:hookMessages, isLoading: hookLoading} = useQuery({
    //     queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
    //     queryFn: () => getHooksMessagesByMonth(params.get("month")!),
    //     placeholderData: [],
    //     enabled: !!params.get("month")
    // })
    
    const hookMessages = useLiveQuery(()=>
        db.hookMessages.where("monthKey").equals(params.get("month"))
        .sortBy("date").then(
            e => e.filter(e=>{
                //type
                if(e.jsonData.action == "sms_receive" && !type.includes("sms")) return false
                if(e.jsonData.action == "notif_post" && !type.includes("notif")) return false
                if(e.jsonData.action == "image_upload" && !type.includes("image")) return false
                if(e.jsonData.action == "image_ai_upload" && !type.includes("image")) return false
                if(e.jsonData.action == "email_received" && !type.includes("email")) return false

                //success
                if((!e.extractedData?.success || e.extractedData.success.toLowerCase() == "false") && !success.includes("no")) return false
                if((!!e.extractedData?.success && e.extractedData.success.toLowerCase() == "true") && !success.includes("yes")) return false
                return true
            })
            .sort((a,b)=>b.date>a.date?1:-1)
                
        )
            
    ,[params.get("month"), success,type])

    const rowVirtualizer = useVirtualizer({
        count: (hookMessages || []).length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35,
        overscan: 5,
    })
    
    const commitDelete = useDebouncedCallback(
        // function
        (value) => {
            if(value.length == 0) return
            deleteMany.mutateAsync(value)
            .then(e=>{
                forDelete.current = forDelete.current.filter(e=>!value.includes(e)) 
            });
        },
        // delay in ms
        5000
      );
    const addDelete = (id:string)=>{
        forDelete.current = [...forDelete.current, id]
        commitDelete(forDelete.current)
    }
    
    const cancelDelete = (id:string)=>{
        forDelete.current = [...forDelete.current.filter(e=>e!=id)]
        commitDelete(forDelete.current)
    }

    const onFilter = (filterType,value)=>{

        let prevQuery = query
        let toFilter= filterType=="type"?type:success
        if(toFilter.includes(value)){
            let newValue = toFilter.filter(e=>value!=e)
            prevQuery.set(filterType,newValue.join(","));
            setQuery(prevQuery)
        }else{
            let newValue = [...toFilter, value]
            prevQuery.set(filterType,newValue.join(","));
            setQuery(prevQuery)
        }




    }


    const setMonthParams = (add)=>{
        let monthstr = moment(params.get("month").toString()).clone().add(add,'month').format("YYYY-MM-DD")
        setParams({month: monthstr})
    }


    const refreshQuery = ()=>{
        queryClient.invalidateQueries({queryKey:[HOOK_MESSAGES, { monthKey: params.get("month")}]})
        // queryClient.prefetchQuery({
        //     queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
        //     queryFn: () => getHooksMessagesByMonth(params.get("month")!),
        //     gcTime:24*60*60
        // })
    }
    
    return   <>
        
        <AppBar position="static"  color="primary" ref={topBarRef}>
            <Toolbar>
                <Grid container sx={{justifyContent: "space-between"}}>
                    <Grid>

                        <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                            Notification and Hooks
                        </Typography>
                        
                    </Grid>
                    <Grid>
                        <UserPanel />
                    </Grid>
                </Grid>

            </Toolbar>
        </AppBar>
        <Grid container sx={{width:"100%", p:2}}>
            <Grid size={{md:3}}></Grid>
            <Grid container size={{md:9}} sx={{ height:(window.innerHeight - topBarSize.height - bottomAppSize.height + rowVirtualizer.getTotalSize() )}} ref={parentRef}>
                <Paper sx={{my:1,p:2, width:'100%'}} ref={topPartRef}>
                    <Grid container sx={{justifyContent:"space-between", alignItems:'center'}}>
                        <Grid>
                            <Typography variant="h6">
                                {moment(params.get("month")).format("MMM YYYY")} 
                                <IconButton onClick={refreshQuery}>
                                    <Refresh />
                                </IconButton>
                            </Typography>
                        </Grid>
                        <Grid>
                            <IconButton onClick={()=>setMonthParams(-1)}>
                                <ArrowLeft />
                            </IconButton>
                            <IconButton onClick={()=>setMonthParams(1)}>
                                <ArrowRight />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
                <Box sx={{py:1}}>
                    <Grid2 container >
                        <Grid2>
                            <Chip label="Confirmed" color="primary" onClick={()=>onFilter("matched", "yes")} variant={success.includes("yes")?"filled":"outlined" }></Chip>
                            <Chip label="Failed Extract" color="primary" onClick={()=>onFilter("matched", "no")}  variant={success.includes("no")?"filled":"outlined" }></Chip>
                        </Grid2>
                        <Grid2>
                            <Chip label="Notifications" color="primary" onClick={()=>onFilter("type", "notif")}  variant={type.includes("notif")?"filled":"outlined" }></Chip>
                            <Chip label="SMS" color="primary"  onClick={()=>onFilter("type", "sms")}  variant={type.includes("sms")?"filled":"outlined" }></Chip>
                            <Chip label="Image" color="primary"  onClick={()=>onFilter("type", "image")}  variant={type.includes("image")?"filled":"outlined" }></Chip>
                            <Chip label="Email" color="primary"  onClick={()=>onFilter("type", "email")}  variant={type.includes("email")?"filled":"outlined" }></Chip>
                        </Grid2>
                    </Grid2>
                </Box>
                <Paper sx={{ width:'100%', overflow:'auto'}}>
                    <List>
                        {isFetching ? <>
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> 
                          <Divider />
                          <ListItem>
                            <ListItemText><Skeleton variant="text" /></ListItemText>
                          </ListItem> </>
                          :
                          rowVirtualizer.getVirtualItems().map(row=><>
                            <HooksErrorBoundary key={row.key} data={hookMessages[row.index]}>

                                 <HooksAccordion key={hookMessages[row.index].id} notif={hookMessages[row.index]} onCancel={cancelDelete} onDelete={addDelete} />
                            </HooksErrorBoundary>
                          </>)
                            }
                        
                    </List>
                </Paper>
            </Grid>
        </Grid>
    </>
}

export  default  Notifications