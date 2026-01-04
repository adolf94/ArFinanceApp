import React, { Component, useState, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./AppRoute";
import { DropdownContext, defaultData } from "./components/useDropdown";
import { Layout } from "./components/Layout";
import db from "./components/LocalDb";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from 'notistack'
import "./custom.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import history, { NavigateSetter } from "./components/History";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { oauthSignIn } from "./common/GoogleLogin";
import { CircularProgress, Grid2 as Grid } from '@mui/material'
import { lightGreen, purple, indigo} from '@mui/material/colors';
import fnApi from "./components/fnApi";
import Loader from "./components/Loader";
import Login from "./Pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext, AuthContextProvider } from "./components/UserInfoContext";
import BackdropLoader, { BackdropLoaderProvider, useBackdropLoader } from "./components/BackdropLoader";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //@ts-ignore
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 60 * 24,
    },

    refetchOnWindowFocus: false,
  },
});

const theme = createTheme({
  typography: {
    transactionHeaderDate: {
      fontSize: "0.75rem",
      fontWeight: "600",
    },
    body1:{
      fontSize: "0.75rem",
    },
    formlabel: { fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', display: 'block', mb: 0.75, fontSize: '0.75rem' }
  },
    palette: {
        primary: indigo,
        secondary: lightGreen,
    },
    
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});
// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

//@ts-ignore
const TheApp = (props) => {
    const [dropdown, setDropdown] = useState(defaultData);
    const [msalInitialized, setInitialized] = useState(false);
    const setDropdownValue = (name, values) => {
        setDropdown({ ...dropdown, [name]: values });
    };
    const navigate = useNavigate()
    const setLoading = useBackdropLoader()



  const handleGoogleRedirect = () => {
    return new Promise((res, rej) => {
      let str = window.location.search;
        if (str === "") {

            setInitialized(true)
            res("")
        };

      const hash2Obj: any = str
        .substring(1)
        .split("&")
        .map((v) => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
        .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});

      if (!hash2Obj.state) {
        
        setInitialized(true)
        res("no_state")
        return
      };
      let stateFromStorage = sessionStorage.getItem("googleLoginState");
      if (decodeURIComponent(hash2Obj.state) !== stateFromStorage) {
        console.debug("state did not match");
        return rej("state_mismatch");
        }

        if (!!hash2Obj?.error && hash2Obj.error === "interaction_required") {
            console.debug("interaction_required")
            oauthSignIn("consent");
            return;
        }


      fnApi.post("/google/auth", { code: decodeURIComponent(hash2Obj.code), app: 'finance' }, { preventAuth: true })
        .then((e) => {
            window.localStorage.setItem("refresh_token", e.data.refresh_token);
            window.sessionStorage.setItem("access_token", e.data.access_token);
            setInitialized(true)

          res("got token");
        }).catch(err => {
            if (!err.response?.status) navigate("/errors/Down")
            if (err.response.status === 401 && !!err.response.headers["X-GLogin-Error"]) {
                console.debug("INVALID CODE")
                oauthSignIn();
            }
            if (err.response.status === 403) {
                navigate("/errors/403")
            }
        });
    });
  };

  useEffect(() => {
      handleGoogleRedirect().then((e) => {
          
          if (e === "") return e;
          if  (e === "no_state") return;
        let stateFromStorage = sessionStorage.getItem("googleLoginState");
          let state = JSON.parse(window.atob(stateFromStorage!))
          //navigate(state.currentPath.replace("/",""))
      });
  }, []);

  const RouteMapper = (routes) => {
    return routes.map((route, index) => {
      const { element, children, ...rest } = route;
      return (
        <Route key={index} {...rest} element={element}>
          {children !== undefined && RouteMapper(children)}
        </Route>
      );
    });
  };

  //@ts-ignore
  return (
    <DropdownContext.Provider value={{ ...dropdown, set: setDropdownValue }}>
            <SnackbarProvider autoHideDuration={1000} >
                {msalInitialized ? <Routes>{RouteMapper(AppRoutes)}</Routes>
                    : <Loader />
                  }
            </SnackbarProvider>
          <NavigateSetter />
      </DropdownContext.Provider>

  );
};

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
    <Layout>
        <ConfirmProvider >
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={theme}>
              <BackdropLoaderProvider>
                <GoogleOAuthProvider clientId={window.webConfig.clientId}>
                  <AuthContextProvider>
                    <Login />
                    <TheApp />
                  </AuthContextProvider>
                </GoogleOAuthProvider>
                </BackdropLoaderProvider>
              </ThemeProvider>
              <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="bottom-left"
              />
            </QueryClientProvider>
           </LocalizationProvider>
        </ConfirmProvider>
      </Layout>
    );
  }
}
