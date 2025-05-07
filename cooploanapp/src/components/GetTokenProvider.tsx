import {createContext, useCallback, useContext, useRef, useState } from "react";
import api from "./api";
import {oauthSignIn} from "./googlelogin";
import {IdToken} from "../Pages/Register";
import { useGoogleLogin } from "@react-oauth/google";
import moment from "moment";
import {navigate} from "./NavigateSetter";

import { jwtDecode as decodeJwt } from 'jwt-decode'
import {  JwtPayload } from "jwt-decode";



export const getTokenProvider = {
    getToken: (cb)=>({}) as any
}
export const GetTokenSetter = () => {
    const [tokenData, setTokenData] = useState({
        token: "",
        lastRefresh : moment().toISOString(),
        isLoggedIn: false,
    })
    const cbResolve = useRef((_)=>{window.console.warn("resolve not assigned")});


    const gLogin = useGoogleLogin({
        onSuccess: codeResponse => {

            cbResolve.current(codeResponse)
            // api.post("/google/auth", { code: decodeURIComponent(codeResponse.code), app: window.webConfig.app}, { preventAuth: true })
            //     .then((e) => {
            //         window.localStorage.setItem("refresh_token", e.data.refresh_token);
            //         window.sessionStorage.setItem("access_token", e.data.access_token);
            //
            //         return e.data;
            //     }).catch(err => {
            //         if (!err.response?.status) {
            //             console.log(err)
            //             return navigate.push("/errors/Down")
            //         }
            //         if (err.response.status === 401 && !!err.response.headers["X-GLogin-Error"]) {
            //             console.debug("INVALID CODE")
            //             oauthSignIn();
            //         }
            //         if (err.response.status === 403) {
            //             navigate.push("/errors/403")
            //         }
            //
            //     })
            //     .then(res=>{
            //         window.sessionStorage.setItem("access_token", res.access_token);
            //         window.localStorage.setItem("idToken", res.access_token);
            //
            //         const tokenJson = decodeJwt<IdToken>(res.id_token)
            //         cbResolve.current(res.access_token);
            //     });



        },
        flow: 'auth-code',
    });


    const getToken = useCallback((cb)=>{

        cbResolve.current = cb;

        gLogin()

    },[])
    getTokenProvider.getToken = getToken;
    return null


}

export  default GetTokenSetter;
