
import AnonymousLayout from "../components/AnonLayout"
import { useEffect, useState } from "react"
import { Google } from '@mui/icons-material'
import { Box, Button, CircularProgress, Grid2 as Grid } from "@mui/material"
import { useNavigate, useSearchParams } from "react-router-dom"
import { oauthSignIn } from "../components/googlelogin"
import api from "../components/api"
import IndexAuthenticated from "./Borrower/Index"
import moment from "moment"
import Register, { IdToken } from './Register'
import { jwtDecode as decodeJwt } from 'jwt-decode'
import useUserInfo, { useUpdateUserInfo } from "../components/userContext"


const Index = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginLoading, setLoading] = useState(false)
    const [idToken, setIdToken] = useState('')
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams();
    const updateUser = useUpdateUserInfo()
    const { user } = useUserInfo()


    const handleGoogleRedirect = () => {
        return new Promise((res, rej) => {
            console.log(searchParams)
            const str = window.location.search;
            if (str === "") {

                res("")
                return;
            };

            const hash2Obj: any = str
                .substring(1)
                .split("&")
                .map((v) => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
                .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});

            if (!hash2Obj.state) return res("no_state");
            const stateFromStorage = sessionStorage.getItem("googleLoginState");
            if (decodeURIComponent(hash2Obj.state) !== stateFromStorage) {
                console.debug("state did not match");
                setSearchParams({})
                return rej("state_mismatch");
            }

            if (!!hash2Obj?.error && hash2Obj.error === "interaction_required") {
                console.debug("interaction_required")
                oauthSignIn("consent");
                return;
            }

            setLoading(true);
            api.post("/google/auth", { code: decodeURIComponent(hash2Obj.code), app: 'loans' }, { preventAuth: true })
                .then((e) => {
                    window.localStorage.setItem("refresh_token", e.data.refresh_token);
                    window.sessionStorage.setItem("access_token", e.data.access_token);

                    res(e.data.id_token);
                }).catch(err => {
                    if (!err.response?.status) {
                        console.log(err)
                        return navigate("/errors/Down")
                    }
                    if (err.response.status === 401 && !!err.response.headers["X-GLogin-Error"]) {
                        console.debug("INVALID CODE")
                        oauthSignIn();
                    }
                    if (err.response.status === 403) {
                        navigate("/errors/403")
                    }
                });
        });
    };

    const isInRole = (jwt: IdToken, role: string) => {

        if (Array.isArray(jwt.role)) {
            return jwt.role.some(e => e.toLowerCase() === role)
        } else {
            return jwt.role.toLowerCase() === role
        }
    }


    useEffect(() => {
        if (user) {
            console.log(user)
            setIsLoggedIn(true)
            return;
        }


        handleGoogleRedirect().then((e: string) => {
            setLoading(false);
            setSearchParams({})

            const token = window.sessionStorage.getItem("access_token");
            if (!token) return
            const tokenJson = decodeJwt<IdToken>(token);
            if (moment().add(1, "minute").isAfter(tokenJson.exp! * 1000)) return
            if (isInRole(tokenJson, "unregistered")) {
                setIdToken(e as string)
                return;
            }
            //validate first

            if (e != "") window.localStorage.setItem("id_token", e);
            if (e === "") {
                e = window.localStorage.getItem("id_token") || ""
            }
            if (e === "") return
            const userInfo = decodeJwt<IdToken>(e)
            setIsLoggedIn(true)
            //@ts-ignore
            console.log(userInfo)
            updateUser(userInfo)

            const stateFromStorage = sessionStorage.getItem("googleLoginState");
            const state = JSON.parse(window.atob(stateFromStorage!))
            navigate(state.currentPath.replace("/loans", ""))
            sessionStorage.removeItem("googleLoginState")
        });
    }, []);


    return <>
        {
            isLoggedIn ? <IndexAuthenticated /> :
                <AnonymousLayout>
                    <Box sx={{ pt: 1, width: "100vw" }} >
                        <Grid container>
                            <Grid size={{ md: 6, xs: 12 }} >

                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>

                                {idToken ? <Register token={idToken} /> : <Box sx={{ pt: '200px', px: 4, display: '' }}>
                                    <Button fullWidth variant="outlined" sx={{ py: 2 }} size="x-large" onClick={() => oauthSignIn()}>
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