import { AppBar, Grid as Grid, IconButton, List, ListItem, ListItemText, Paper, Toolbar, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import UserPanel from "../components/UserPanel.js";
import {getHooksMessages, HOOK_MESSAGES} from "../repositories/hookMessages.js";


const Notifications = ()=>{
    const {data:hookMessages, isLoading: hookLoading} = useQuery({
        queryKey: [HOOK_MESSAGES],
        queryFn: ()=>getHooksMessages(),
        placeholderData:[]
    })
    
    
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
            <Grid md={9}>
                <Paper>
                    <List>
                        {!hookLoading && hookMessages.map(e=><ListItem>
                            <ListItemText>
                                {e.rawMsg}
                            </ListItemText>
                        </ListItem>)}
                        
                    </List>
                </Paper>
            </Grid>
            
        </Grid>
    </>
}

export  default  Notifications