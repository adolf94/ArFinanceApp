webConfig = {
  msal: {
      "auth": {
        "clientId": "7af7001b-6c58-421c-8999-853280293e4b",
        "authority": "https://login.microsoftonline.com/common",
        "redirectUri": "/",
        "postLogoutRedirectUri": "/logout"
      },
      "cache": {
        "cacheLocation": "sessionStorage"
      },
  },
  api: 'https://localhost:7146/api'
}