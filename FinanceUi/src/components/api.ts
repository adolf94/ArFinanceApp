import axios, { AxiosRequestConfig } from "axios";
import moment from "moment";
import { oauthSignIn } from "../common/GoogleLogin";
import { memoize as mm } from "underscore";

const getTokenFromApi = mm(
  () => {
    let token = window.localStorage.getItem("refresh_token");

    if (!token) return oauthSignIn();
    return axios
      .post(`${window.webConfig.api}/google/auth/refresh`, {
        refresh_token: token,
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
  baseURL: window.webConfig.api,
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  if (config.preventAuth) return config;
  let token = await getToken(config.retryGetToken);
  config.headers!.Authorization = "Bearer " + token;
  return config;
});

api.interceptors.response.use(
    async (data) => data,
    (err) => {
   
      if (err.response.status === 401 && !err.request.retryGetToken) {
          console.debug("retry with getToken");
          return api({ ...err.request, retryGetToken: true })
      }
    //return Promise.reject(err)
  },
);

export default api;
