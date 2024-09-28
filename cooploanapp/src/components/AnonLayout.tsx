import { AppBar, Box, Grid2 as Grid, Toolbar, Typography, Avatar } from '@mui/material';
import { CurrencyExchange } from '@mui/icons-material';
import { ReactNode } from 'react';


interface AnonymousLayoutProps {
    children: ReactNode;
}
const AnonymousLayout = ({ children }: AnonymousLayoutProps) => {


    return <>
        <Box flexGrow={1}>
            <AppBar position="static" sx={{ bgColor: 'white' }}>
                <Toolbar>
                    <CurrencyExchange
                        sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        AR Loan
                    </Typography>
                    <Avatar>A</Avatar>
                </Toolbar>
            </AppBar>
        </Box>
        <Grid container>
            {children}
        </Grid>



    </>
}

export default AnonymousLayout