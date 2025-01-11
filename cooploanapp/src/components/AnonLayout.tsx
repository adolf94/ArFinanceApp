import { AppBar, Box, Grid2 as Grid, Toolbar, Typography, Avatar } from '@mui/material';
import { CurrencyExchange } from '@mui/icons-material';
import { ReactNode } from 'react';
import NavigateSetter from "./NavigateSetter";


interface AnonymousLayoutProps {
    children: ReactNode;
}
const AnonymousLayout = ({ children }: AnonymousLayoutProps) => {


    return <>
        <NavigateSetter />
        <Box flexGrow={1}>
            <AppBar position="static" sx={{ bgColor: 'white' }}>
                <Toolbar>
                    <Box sx={{ mr: 'auto', display: 'flex', alignItems:'center' }}>
                        {
                            window.webConfig.app == "cecl"?
                                <Box component="img" src={`${import.meta.env.BASE_URL}/media/cecl_ico.png`} sx={{maxWidth:'50px'}}/>
                                : <CurrencyExchange
                                    sx={{ mr: 2 }} />
                        }

                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml:3 }}>
                            {  //@ts-ignore
                                window.webConfig?.appName}
                        </Typography>
                    </Box>
                    <Box>
                        <Avatar>A</Avatar>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
        <Grid container>
            {children}
        </Grid>



    </>
}

export default AnonymousLayout