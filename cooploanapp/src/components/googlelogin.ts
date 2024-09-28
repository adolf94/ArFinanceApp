import { v4 } from "uuid";

export const oauthSignIn = (promptType?: string) => {
    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    const { protocal, host, pathname, search } = window.location;
    const state = {
        currentPath: `${pathname}${search}`,
        uid: v4(),
    };

    const base64State = btoa(JSON.stringify(state));
    sessionStorage.setItem("googleLoginState", base64State);

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    const form = document.createElement("form");
    form.setAttribute("method", "GET"); // Send as a GET request.
    form.setAttribute("action", oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {
        client_id: window.webConfig.clientId,
        response_type: "code",
        scope: "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        access_type: "offline",
        include_granted_scopes: "true",
        state: base64State,
        redirect_uri: window.webConfig.redirectUri,
        prompt: promptType || "none",
    };

    // Add form parameters as hidden input values.
    for (let p in params) {
        let input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", p);
        input.setAttribute("value", params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
};

