import { AppBar, Box, Button, Grid, IconButton, List, ListItem, ListItemText, Paper, Toolbar, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import UserPanel from "../components/UserPanel.js";
import {getHooksMessages, getHooksMessagesByMonth, HOOK_MESSAGES} from "../repositories/hookMessages.js";
import HooksAccordion from "./Notifications/HooksAccordion.jsx";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Refresh } from "@mui/icons-material";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../components/LocalDb/AppDb.js";
import { queryClient } from "../App.jsx";




const Notifications = () => {
    const [params, setParams] = useSearchParams({
        month: moment().format("YYYY-MM-01")
    })

    // const {data:hookMessages, isLoading: hookLoading} = useQuery({
    //     queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
    //     queryFn: () => getHooksMessagesByMonth(params.get("month")!),
    //     placeholderData: [],
    //     enabled: !!params.get("month")
    // })

    const hookMessages = useLiveQuery(()=>
        db.hookMessages.where("monthKey").equals(params.get("month"))
        .sortBy("date").then(
            e => e.sort((a,b)=>b.date>a.date?1:-1)
        )
            
    ,[params.get("month")])

    useEffect(()=>{
        queryClient.prefetchQuery({
                queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
                queryFn: () => getHooksMessagesByMonth(params.get("month")!),
                gcTime:24*60*60
            })
    },[params.get("month")])


    const setMonthParams = (add)=>{
        let monthstr = moment(params.get("month").toString()).clone().add(add,'month').format("YYYY-MM-DD")
        setParams({month: monthstr})
    }

    const refreshQuery = ()=>{
        queryClient.invalidateQueries({queryKey:[HOOK_MESSAGES, { monthKey: params.get("month")}]})
        queryClient.prefetchQuery({
            queryKey: [HOOK_MESSAGES, { monthKey: params.get("month")}],
            queryFn: () => getHooksMessagesByMonth(params.get("month")!),
            gcTime:24*60*60
        })
    }
    
    return   <>
        
        <AppBar position="static"  color="primary">
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
            <Grid md={3}></Grid>
            <Grid container md={9}>
                <Paper sx={{my:1,p:2, width:'100%'}}>
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
                <Paper sx={{ width:'100%'}}>
                    <List>
                        {!!hookMessages && hookMessages.map(e => <HooksAccordion key={e.id} notif={ e} onDelete={()=>{}} />)}
                        
                    </List>
                </Paper>
            </Grid>
            
        </Grid>
    </>
}

export  default  Notifications