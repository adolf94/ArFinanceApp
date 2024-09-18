import React, { Component, useState, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./AppRoute";
import { DropdownContext, defaultData } from "./components/useDropdown";
import { Layout } from "./components/Layout";
import db from "./components/LocalDb";
import { ConfirmProvider } from "material-ui-confirm";
import { SnackbarProvider } from 'notistack'
import api from "./components/api";
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
      fontSize: "1rem",
      fontWeight: "600",
    },
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
    const location = useLocation()




  const handleGoogleRedirect = () => {
    return new Promise((res, rej) => {
      let str = window.location.search;
        console.log(location);
        if (str === "") {

            setInitialized(true)
            res("")
        };

      const hash2Obj: any = str
        .substring(1)
        .split("&")
        .map((v) => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
        .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});

      if (!hash2Obj.state) return res("no_state");
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


      api.post("/google/auth", { code: decodeURIComponent(hash2Obj.code) }, { preventAuth: true })
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
        let stateFromStorage = sessionStorage.getItem("googleLoginState");
          let state = JSON.parse(window.atob(stateFromStorage!))
          navigate(state.currentPath.replace("/finance",""))
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
              {msalInitialized && <Routes>{RouteMapper(AppRoutes)}</Routes>}
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
              <TheApp />
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
