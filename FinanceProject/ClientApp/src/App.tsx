import React, { Component, useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
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




export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      //@ts-ignore
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
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


const TheApp = (props) => {

  const [dropdown, setDropdown] = useState(defaultData)

  const setDropdownValue = (name, values) => {
    setDropdown({ ...dropdown, [name]: values })
  }

  useEffect(() => {

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
  
    <Routes>
    {RouteMapper(AppRoutes)}
    </Routes>
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
          </QueryClientProvider>
        </LocalizationProvider>
      </Layout>
    );
  }
}
