import { PublicClientApplication } from "@azure/msal-browser";

//@ts-ignore
var msalInstance = new PublicClientApplication(window.webConfig.msal);

export default msalInstance