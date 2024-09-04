import {v4 } from 'uuid'

export const oauthSignIn = () => {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const  {protocal , host, pathname, search } = window.location
    var state = {
        currentPath: `${pathname}${search}`,
        uid: v4()
    }

    var base64State = btoa(JSON.stringify(state));
    sessionStorage.setItem("googleLoginState", base64State);

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {
        'client_id': '929828408348-sq488sibic3oquur1ov5ke3jos7sgfmv.apps.googleusercontent.com',
        'response_type': 'code',
        'scope': 'openid',
        "access_type" : 'offline',
        'include_granted_scopes': 'true',
        'state': base64State,
        "redirect_uri": "https://localhost:5173/finance",
        "prompt":'login'
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
        var input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
}


function handleGoogleRedirect (dAtA){
    console.log(dAtA)
    let str = window.location.hash

    if (str === "") return "no query"

    const hash2Obj: any = str.substring(1)
        .split("&")
        .map(v => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
        .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});


    if (!hash2Obj.state) return "no_state";
    let stateFromStorage = sessionStorage.getItem("googleLoginState");
    if (decodeURIComponent(hash2Obj.state) !== stateFromStorage) {
        console.debug("state did not match")
        console.debug(stateFromStorage)
        console.debug(decodeURIComponent(hash2Obj.state))
        return "state_mismatch";
    }
    console.log(hash2Obj)
    setCode(hash2Obj.code)

}