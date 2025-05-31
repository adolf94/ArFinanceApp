import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { oauthSignIn } from "../common/GoogleLogin";
import { memoize as mm } from "underscore";
import { queryClient } from "../App";
import { getAfterTransaction, TRANSACTION } from "../repositories/transactions";
import { enqueueSnackbar } from "notistack";



const getTokenFromApi = mm(
  () => {
    let token = window.localStorage.getItem("refresh_token");

    if (!token) return oauthSignIn();
    return axios
      .post(`${window.webConfig.oldApi}/google/auth/refresh`, {
        refresh_token: token,
          app: 'finance'
      })
      .then((e) => {
        window.sessionStorage.setItem("access_token", e.data.access_token);
        return e.data.access_token;
      })
      .catch(() => {
        oauthSignIn();
      });
  },
  (e) => moment().format("yyyyMMddHHmm"),
);

export const getToken = async (force : boolean) => {
  let token = window.sessionStorage.getItem("access_token");

  if (!token || force) token = await getTokenFromApi();

  let tokenJson = JSON.parse(window.atob(token!.split(".")[1]));

  if (moment().add(1, "minute").isAfter(tokenJson.exp * 1000 ))
    token = await getTokenFromApi();

  return token;
};

const api = axios.create({
  //@ts-ignore
  baseURL: window.webConfig.oldApi,
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  if (config.preventAuth) return config;
  let token = await getToken(config.retryGetToken);
  config.headers!.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
    async (data) => {
        //     const headerTransId = data.headers["x-last-trans"];
        // if (!data.config?.noLastTrans && !!headerTransId) {
        //     const lastTransId = localStorage.getItem("last_transaction");
        //     const stgTransId = localStorage.getItem("stg_transaction");
        //     if (!!lastTransId && headerTransId !== lastTransId && stgTransId !== headerTransId) {
        //         //Do fetch new data
        //             queryClient.prefetchQuery({ queryKey: [TRANSACTION, { after: lastTransId }], queryFn: () => getAfterTransaction(lastTransId) })
        //     }
        // }
        // if (!headerTransId) {
        //     console.debug("no last-trans found " + data.config.url);
        // }
            

        //queryClient


        
        return data;
    },
    (err) => {
        if (!!err?.response) {
            if (err.response.status === 401 && !err.request.retryGetToken) {
                console.debug("retry with getToken");
                return api({ ...err.request, retryGetToken: true })
            }
            if(err.response.status === 500){
                enqueueSnackbar("Something went wrong!. Contact Developer", {variant:"error", autoHideDuration: 3000});
            }
        }
    return Promise.reject(err)
  },
);

export default api;
