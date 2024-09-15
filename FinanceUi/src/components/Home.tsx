import React, { Component, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { oauthSignIn } from "../common/GoogleLogin";
import { v4 } from "uuid";
import axios from "axios";
import {
  GoogleOAuthProvider,
  useGoogleLogin,
  GoogleLogin,
} from "@react-oauth/google";
import qs from "qs";
import api from "./api";

const LoginButton = () => {
  const [code, setCode] = useState("");

  const login = useGoogleLogin({
    onSuccess: (resp) => {
      console.log(resp);
    },
    flow: "auth-code",
    redirect_uri: "https://localhost:5173/finance",
    ux_mode: "redirect",
  });
  console.log(code);

  return (
    <>
      <Button variant="contained" onClick={login}>
        UseGoogleLogin
      </Button>

      <GoogleLogin
        onSuccess={(credentialResponse) => {
          console.log(credentialResponse);
        }}
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
      />

      <Button variant="contained" onClick={login}>
        Login
      </Button>
    </>
  );
};

export const Home = () => {
  const [client, setClient] = useState(null);
  const [code, setCode] = useState("");
  const [refresh, setRefresh] = useState("");
  const [loginState, setLoginState] = useState("");

  const getToken = () => {
    api
      .post(
        "/google/auth/refresh",
        { Refresh_Token: refresh },
        { preventAuth: true },
      )
      .then((e) => console.log(e.data));
  };

  useEffect(() => {}, []);

  const redirectLogin = () => {
  };

  return (
    <>
      <GoogleOAuthProvider
        clientId={
          "929828408348-sq488sibic3oquur1ov5ke3jos7sgfmv.apps.googleusercontent.com"
        }
      >
       
      </GoogleOAuthProvider>
    </>
  );
};
