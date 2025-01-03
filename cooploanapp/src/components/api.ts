import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { oauthSignIn } from "./googlelogin";
import { memoize as mm } from "underscore";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { enqueueSnackbar } from "notistack";


interface IdToken extends JwtPayload {
    email: string,
    name: string
}


const getTokenFromApi = mm(
    () => {
        const token = window.localStorage.getItem("refresh_token");

        if (!token) return oauthSignIn();
        return axios
            .post(`${window.webConfig.api}/google/auth/refresh`, {
                refresh_token: token,
            })
            .then((e) => {
                window.sessionStorage.setItem("access_token", e.data.access_token);
                if(e.data.refresh_token) {
                    window.localStorage.setItem("refresh_token", e.data.refresh_token);
                }
                return e.data.access_token;
            })
            .catch((e) => {
                console.log(e);
                oauthSignIn();
            });
    },
    (e) => moment().format("yyyyMMddHHmm"),
);

export const getToken = async (force: boolean) => {
    let token = window.sessionStorage.getItem("access_token");

    if (!token || force) token = await getTokenFromApi();


    const tokenJson = jwtDecode<JwtPayload>(token!)
    console.debug("tokenJson", moment(tokenJson.exp! * 1000).fromNow());
    if (moment().add(1, "minute").isAfter(tokenJson.exp! * 1000))
        token = await getTokenFromApi();

    return token;
};

const api = axios.create({
    //@ts-ignore
    baseURL: window.webConfig.api,
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
    if (config.preventAuth) return config;
    const token = await getToken(config.retryGetToken);
    config.headers!.Authorization = "Bearer " + token;
    return config;
});

api.interceptors.response.use(
    async (data) => {
        //const headerTransId = data.headers["x-last-trans"];
        //if (!data.config?.noLastTrans && !!headerTransId) {
        //    const lastTransId = localStorage.getItem("last_transaction");
        //    const stgTransId = localStorage.getItem("stg_transaction");
        //    if (!!lastTransId && headerTransId !== lastTransId && stgTransId !== headerTransId) {
        //        //Do fetch new data
        //        queryClient.prefetchQuery({ queryKey: [TRANSACTION, { after: lastTransId }], queryFn: () => getAfterTransaction(lastTransId) })
        //    }
        //}
        //if (!headerTransId) {
        //    console.debug("no last-trans found " + data.config.url);
        //}


        //queryClient



        return data;
    },
    (err) => {
        if (!!err?.response) {
            if (err.response.status === 401 && !err.response.config.retryGetToken) {
                console.debug("retry with getToken");
                return api({ ...err.response.config, retryGetToken: true })
            }

            if(err.response.status === 500){
                enqueueSnackbar("Something went wrong!", {variant:'error'})
            }

            if(err.response.status === 400){
                enqueueSnackbar("Please check inputs", {variant:'error'})
            }


            if(err.response.status === 403){
                enqueueSnackbar("You may not have access to do this. Contact system admin", {variant:'error'})
            }
            
        }else{
            enqueueSnackbar("API Might be off", {variant:'error'})
        }
        return Promise.reject(err)
    },
);

export default api;
