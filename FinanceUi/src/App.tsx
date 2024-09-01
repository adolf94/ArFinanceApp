import React, { Component, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoute';
import { DropdownContext, defaultData } from './components/useDropdown';
import { Layout } from './components/Layout';
import db from './components/LocalDb'
import api from './components/api'
import './custom.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {  createTheme, ThemeProvider } from '@mui/material/styles';
import { EventType, PublicClientApplication } from "@azure/msal-browser";
import msalInstance from './common/msalInstance'; 
import history, { NavigateSetter }  from './components/History';
import { CustomNavigationClient } from './components/NavigationClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';



export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //@ts-ignore
          cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 60000
        },
        
        refetchOnWindowFocus: false,
  },
})

const theme = createTheme({
  typography: {
      transactionHeaderDate: {
        fontSize: '1rem',
        fontWeight: '600'
      }
    }
  })

const localStoragePersister = createSyncStoragePersister({ storage: window.localStorage })
// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})



//@ts-ignore
const TheApp = (props) => {

    const [dropdown, setDropdown] = useState(defaultData)
    const [msalInitialized, setInitialized] = useState(false)
    const setDropdownValue = (name, values) => {
        setDropdown({ ...dropdown, [name]: values })
    }


    const fetchUserInfo = () => {
        api
    }

  useEffect(() => {
    (async () => {
      await msalInstance.initialize()


      const navigationClient = new CustomNavigationClient(history);
        msalInstance.setNavigationClient(navigationClient);



        msalInstance.addEventCallback((event) => {
            if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
                //@ts-ignore
                const account = event.payload.account;
                msalInstance.setActiveAccount(account);
            }
            if (event.eventType === EventType.HANDLE_REDIRECT_END) {
                //fetchUserInfo();
            }
        });

      msalInstance.handleRedirectPromise().then((tokenResponse) => {
        // Check if the tokenResponse is null
        // If the tokenResponse !== null, then you are coming back from a successful authentication redirect.
        // If the tokenResponse === null, you are not coming back from an auth redirect.
        //@ts-ignore


        let accounts = msalInstance.getAllAccounts();
        if (accounts.length == 1) {
          setInitialized(true)
          msalInstance.setActiveAccount(accounts[0])

        } else {
          msalInstance.loginRedirect({scopes:[]})
        }
      }).catch((error) => {


        try {
        } catch (err) {
          console.log(err);
        }

        // handle error, either in the library or coming back from the server
      });
    })() 
  }, [])


  const RouteMapper = (routes) => {
    return routes.map((route, index) => {
      const { element,children, ...rest } = route;
      return <Route key={index} {...rest} element={element}>
          {children != undefined && RouteMapper(children) }
        </Route>;
    })
  }

  //@ts-ignore
  return <DropdownContext.Provider value={{ ...dropdown, set: setDropdownValue } } >
    {msalInitialized && <Routes>
      {RouteMapper(AppRoutes)}
    </Routes>  }
    <NavigateSetter />
  </DropdownContext.Provider>
}

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Layout>
        <LocalizationProvider dateAdapter={ AdapterMoment } >
          <QueryClientProvider client={ queryClient} >
            <ThemeProvider theme={theme}>
              <TheApp />
                    </ThemeProvider>
                    <ReactQueryDevtools initialIsOpen={false} buttonPosition="button-left" />
          </QueryClientProvider>
        </LocalizationProvider>
      </Layout>
    );
  }
}
