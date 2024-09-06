import React, { Component, useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoute";
import { DropdownContext, defaultData } from "./components/useDropdown";
import { Layout } from "./components/Layout";
import db from "./components/LocalDb";
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
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import msalInstance from "./common/msalInstance";
import history, { NavigateSetter } from "./components/History";
import { CustomNavigationClient } from "./components/NavigationClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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

  const fetchUserInfo = () => {
    api.get("/user/login");
  };

  const handleGoogleRedirect = () => {
    return new Promise((res, rej) => {
      let str = window.location.search;

      if (str === "") return res("no query");

      const hash2Obj: any = str
        .substring(1)
        .split("&")
        .map((v) => v.split(`=`, 1).concat(v.split(`=`).slice(1).join(`=`)))
        .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {});

      if (!hash2Obj.state) return res("no_state");
      let stateFromStorage = sessionStorage.getItem("googleLoginState");
      if (decodeURIComponent(hash2Obj.state) !== stateFromStorage) {
        console.debug("state did not match");
        console.debug(stateFromStorage);
        console.debug(decodeURIComponent(hash2Obj.state));
        return rej("state_mismatch");
      }
      api
        .post("/google/auth", { code: hash2Obj.code }, { preventAuth: true })
        .then((e) => {
          window.localStorage.setItem("refresh_token", e.data.refresh_token);
          res("got token");
        });
    });
  };

  useEffect(() => {
    handleGoogleRedirect().then((e) => setInitialized(true));
  }, []);

  const RouteMapper = (routes) => {
    return routes.map((route, index) => {
      const { element, children, ...rest } = route;
      return (
        <Route key={index} {...rest} element={element}>
          {children != undefined && RouteMapper(children)}
        </Route>
      );
    });
  };

  //@ts-ignore
  return (
    <DropdownContext.Provider value={{ ...dropdown, set: setDropdownValue }}>
      {msalInitialized && <Routes>{RouteMapper(AppRoutes)}</Routes>}
      <NavigateSetter />
    </DropdownContext.Provider>
  );
};

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Layout>
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
      </Layout>
    );
  }
}
