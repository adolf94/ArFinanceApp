import { AppBar, Box, Grid2 as Grid, Toolbar, Typography, Avatar, Button, Menu, MenuItem } from '@mui/material';
import { CurrencyExchange, ArrowDropDown } from '@mui/icons-material';
import { ReactNode, useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { UserContextValue, UserContext, useUpdateUserInfo } from './userContext';
import { oauthSignIn } from './googlelogin';


interface AuthenticatedLayoutProps {
    children: ReactNode;
    persona: string 
}


const PersonaMenu = ({ persona } :{ persona:string }) => {

        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
    };
        const navigate = useNavigate()
        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <div>
                <Button
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    variant="outlined"
                    color="info"
                    sx={{color:'white'} }
                >
                    {persona || "Borrower"} <ArrowDropDown />
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={()=>navigate("/")}>Borrower</MenuItem>
                    <MenuItem onClick={() => navigate("/member")}>Member</MenuItem>
                    <MenuItem onClick={() => navigate("/admin")}>Admin</MenuItem>
                </Menu>
            </div>
        );
}



const AuthenticatedLayoutChild = ({ children, persona, contextValue }: { contextValue: UserContextValue } & AuthenticatedLayoutProps) => {

    const navigate = useNavigate()
    const [loggedIn, setLoggedIn] = useState(false)
    const updateUser = useUpdateUserInfo()

    useEffect(() => {
        //check if token is valid
        if(loggedIn) return
        const token = window.sessionStorage.getItem("access_token");
        if (!token) return oauthSignIn()
        const tokenJson = JSON.parse(window.atob(token!.split(".")[1]));

        if (moment().add(1, "minute").isAfter(tokenJson.exp * 1000)) oauthSignIn()
        updateUser(tokenJson);
        setLoggedIn(true)
        return

    }, [navigate, children])



    return loggedIn && <>
            <Box flexGrow={1}>
                <AppBar position="static" sx={{ bgColor: 'white' }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ mr: 'auto', display: 'flex' }}>
                            <CurrencyExchange
                                sx={{ mr: 2 }} />
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                AR Loan
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex' }}>
                            <PersonaMenu persona={persona} />
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

const AuthenticatedLayout = (props : AuthenticatedLayoutProps) => {



    return <UserContext.Consumer>

        {value => <AuthenticatedLayoutChild {...props} contextValue={ value } /> }

    </UserContext.Consumer>
}

export default AuthenticatedLayout