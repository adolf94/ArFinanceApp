import axios, { AxiosRequestConfig } from 'axios'
import msalInstance from '../common/msalInstance';
import { BrowserAuthError, InteractionRequiredAuthError } from '@azure/msal-browser';






export const getToken = async () => {

  /*  ...loginrequest*/
  return msalInstance.acquireTokenSilent({ account: msalInstance.getAllAccounts()[0], scopes: (window as any).webConfig.msal.scopes }).then((tokenResponse: { accessToken: string; }) => {
    // User is not Logged in yet -- throw
    // User has logged in, but accessToken has expired - throw error
    // User has logged in, access Token is not expired 
    return tokenResponse.accessToken
  }).catch((error: any) => {
    if (error instanceof InteractionRequiredAuthError) {
      // fallback to interaction when silent call fails
      return msalInstance.acquireTokenRedirect({ scopes: (window as any).webConfig.msal.scopes } )
    } else if (error instanceof BrowserAuthError) {
      return msalInstance.acquireTokenRedirect({ scopes: (window as any).webConfig.msal.scopes } )
    }
  })



}


const api = axios.create({
  //@ts-ignore
  baseURL:window.webConfig.api
})

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  let token = await getToken()
  config.headers['Authorization'] = 'Bearer ' + (token);
  return config
})

export default api