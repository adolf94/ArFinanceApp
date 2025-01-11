import { AppBar, Box, Grid2 as Grid, Toolbar, Typography, Avatar, Button, Menu, MenuItem } from '@mui/material';
import { CurrencyExchange, ArrowDropDown } from '@mui/icons-material';
import { ReactNode, useEffect, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import useUserInfo, { UserContextValue, UserContext, useUpdateUserInfo } from './userContext';
import { oauthSignIn } from './googlelogin';
import NavigateSetter, {navigate} from "./NavigateSetter";
import {getTokenProvider} from "./GetTokenProvider";


interface AuthenticatedLayoutProps {
    children: ReactNode;
    persona: string,
    roles? :string[]
}


const PersonaMenu = ({ persona } :{ persona:string }) => {

        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);
        const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
    };
        const navigate = useNavigate()
        const {isInRole} = useUserInfo()
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
                    {isInRole("COOP_MEMBER") && <MenuItem onClick={() => navigate("/member")}>Member</MenuItem>}
                    {isInRole("MANAGE_LOAN") && <MenuItem onClick={() => navigate("/admin")}>Admin</MenuItem> }
                </Menu>
            </div>
        );
}



const PictureMenu = ()=>{
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const navigate = useNavigate()
    const {isInRole, user} = useUserInfo()
    const handleClose = () => {
        setAnchorEl(null);
    };

    console.log(user)
    
    return <Box>
        <Avatar
            sx={{cursor: 'pointer'}}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
        >A</Avatar>
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
            <MenuItem>{user.name}</MenuItem>
            {isInRole("COOP_MEMBER") && <MenuItem onClick={() => navigate("/member")}>Member</MenuItem>}
            {isInRole("MANAGE_LOAN") && <MenuItem onClick={() => navigate("/admin")}>Admin</MenuItem> }
        </Menu>
    </Box>
}


const AuthenticatedLayoutChild = ({ children, persona, roles, contextValue }: { contextValue: UserContextValue } & AuthenticatedLayoutProps) => {

    const navigate = useNavigate()
    const [loggedIn, setLoggedIn] = useState(false)
    const updateUser = useUpdateUserInfo()
    const {isInRole} = useUserInfo()

    useEffect(() => {
        //check if token is valid
        if(loggedIn) return
        const token = window.sessionStorage.getItem("access_token");
        
        const postTokenFn = (token : string)=>{
            const tokenJson = JSON.parse(window.atob(token!.split(".")[1]));
            const { protocal, host, pathname, search } = window.location;

            if (moment().add(1, "minute").isAfter(tokenJson.exp * 1000)) {
                if(window.webConfig.basePath !== `${pathname}${search}`) {
                    navigate("/", { state: { nextUrl: `${pathname}${search}` } });
                }
                return
            }   
            
            updateUser(tokenJson);
            setLoggedIn(true)
        }
        
        
        if (!token) {
            const { protocal, host, pathname, search } = window.location;
            if(window.webConfig.basePath !== `${pathname}${search}`) {
                navigate("/", { state: { nextUrl: `${pathname}${search}` } });
            }
            // getTokenProvider.getToken(postTokenFn)
        }else{
            postTokenFn(token)
        }

    }, [])

    useEffect(() => {
        if(!loggedIn || !roles ) return;
        if(Array.isArray(roles)){
            if(!roles.some(e=>isInRole(e))) navigate("/Errors/403")
        }
    }, [roles,loggedIn]);

    return loggedIn && <>
            <NavigateSetter />
            <Box flexGrow={1}>
                <AppBar position="static" sx={{ bgColor: 'white' }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
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
                        <Box sx={{ display: 'flex' }}>
                            <PersonaMenu persona={persona} />
                            <PictureMenu />
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

        {value => <AuthenticatedLayoutChild {...props} contextValue={ value }  children={props.children}/> }

    </UserContext.Consumer>
}

export default AuthenticatedLayout