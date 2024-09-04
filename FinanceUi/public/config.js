window.webConfig = {
  msal: {
      "auth": {
      "clientId": "7af7001b-6c58-421c-8999-853280293e4b",
      "authority": "https://login.microsoftonline.com/2fa1ddf7-29f1-4d4a-975c-8b29073494af",
        "redirectUri": "/finance",
        "postLogoutRedirectUri": "/logout"
      },
      "cache": {
        "cacheLocation": "localStorage"
      },
    "scopes": ["api://7af7001b-6c58-421c-8999-853280293e4b/user_impersonation"]
  },
  api: 'https://localhost:7129/api'
}
