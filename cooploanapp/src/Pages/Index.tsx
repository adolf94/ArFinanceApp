
import AnonymousLayout from "../components/AnonLayout"
import { useEffect, useState } from "react"
import { Google } from '@mui/icons-material'
import { Box, Button, CircularProgress, Grid2 as Grid } from "@mui/material"
import {useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { oauthSignIn } from "../components/googlelogin"
import api from "../components/api"
import IndexAuthenticated from "./Borrower/Index"
import moment from "moment"
import Register, { IdToken } from './Register'
import { jwtDecode as decodeJwt } from 'jwt-decode'
import useUserInfo, { useUpdateUserInfo } from "../components/userContext"
import ProgressiveImage from "../components/ProgressiveImg";
import { useGoogleLogin } from "@react-oauth/google"
import app from "../App";


const Index = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginLoading, setLoading] = useState(false)
    const [idToken, setIdToken] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams, setSearchParams] = useSearchParams();
    const updateUser = useUpdateUserInfo()
    const { user } = useUserInfo()

    
    const handleToken = (idToken : string)=>{
        const tokenJson = decodeJwt<IdToken>(idToken);
        if (moment().add(1, "minute").isAfter(tokenJson.exp! * 1000)) return
        if (isInRole(tokenJson, "unregistered")) {
            setIdToken(idToken as string)
            return;
        }
        //validate first

        if (idToken != "") window.localStorage.setItem("id_token", idToken);
        if (idToken === "") {
            idToken = window.localStorage.getItem("id_token") || ""
        }
        if (idToken === "") return
        const userInfo = decodeJwt<IdToken>(idToken)
        //@ts-ignore
        updateUser(userInfo)
        setIsLoggedIn(true)
        if(!location?.state) return
        navigate(location?.state.nextUrl.replace(window.webConfig.basePath, ""))
    }
    
    const loginGoogle = useGoogleLogin({
        redirect_uri: window.webConfig.redirectUri,
        onSuccess: codeResponse => {
            setLoading(true);

            api.post("/google/auth", { code: codeResponse.code, app: window.webConfig.app}, { preventAuth: true })
                .then((e) => {
                    window.localStorage.setItem("refresh_token", e.data.refresh_token);
                    window.sessionStorage.setItem("access_token", e.data.access_token);
            
                    return e.data;
                }).catch(err => {
                    if (!err.response?.status) {
                        console.log(err)
                        return navigate.push("/errors/Down")
                    }
                    if (err.response.status === 401 && !!err.response.headers["X-GLogin-Error"]) {
                        console.debug("INVALID CODE")
                    }
                    if (err.response.status === 403) {
                        navigate.push("/errors/403")
                    }

                })
                .then(res=>{
                    window.localStorage.setItem("id_token", res.id_token);

                    handleToken(res.id_token)
                    setLoading(false);
                });



        },
        flow: 'auth-code',
    });
    
    
    
    
    const isInRole = (jwt: IdToken, role: string) => {

        if (Array.isArray(jwt.role)) {
            return jwt.role.some(e => e.toLowerCase() === role)
        } else {
            return jwt.role.toLowerCase() === role
        }
    }


    useEffect(() => {
        
        if(searchParams.get("logout")){
            setIsLoggedIn(false)
            updateUser({})
            setSearchParams({})
            window.sessionStorage.clear();
            window.localStorage.clear();
            return;
        }
        
        if (!!user?.userId) {
            setIsLoggedIn(true)
            return;
        }


        
        let idToken = window.localStorage.getItem("id_token") || ""
        if(idToken) handleToken(idToken)
       
    }, [searchParams]);


    return <>
        {
            isLoggedIn ? <IndexAuthenticated /> :
                <AnonymousLayout>
                    <Box sx={{ pt: 1, width: "100vw" }} >
                        <Grid container>
                            <Grid container size={{ md: 6, xs: 12 }} sx={{justifyContent: 'center'}} >
                                {window.webConfig.app=="cecl" && <Box sx={{px:5,mt:2}}>
                                    <ProgressiveImage sx={{maxWidth:'70vw'}} src={`${import.meta.env.BASE_URL}/media/cecl_md.png`} placeholdersrc={`${import.meta.env.BASE_URL}/media/cecl_xs.png`} />
                                </Box>}
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>

                                {idToken ? <Register token={idToken} /> : <Box sx={{ pt:{xs:'50px',md:'200px'}, px: 4, display: '' }}>
                                    <Button fullWidth variant="outlined" sx={{ py: 2 }} size="x-large" onClick={() => loginGoogle()}>
                                        <Google sx={{ mr: 1 }} /> {loginLoading ? <CircularProgress /> : "Login/Register with Google"}</Button>

                                </Box>}
                            </Grid>
                        </Grid>
                    </Box>
                </AnonymousLayout>
        }
    </>


}

export default Index