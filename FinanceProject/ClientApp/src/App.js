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




export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
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
    setDropdown({...dropdown,[name]:values})
  }

  useEffect(() => {
    Promise.all([
      api.get("accounttypes").then(e=>e.data),
      api.get("accountgroups").then(e => e.data),
      api.get("accounts").then(e => e.data),
      api.get("vendors").then(e => e.data)
    ]).then(async (data) => {
      db.accountTypes.bulkPut(data[0])
      db.accountGroups.bulkPut(data[1])
      let currentAccounts = await db.accounts.toArray()
      let accounts = data[2].map((a) => {
        let saved = currentAccounts.find(s => s.id == a.id)
        if (saved) return saved
        return a
      })
      db.accounts.bulkPut(accounts)
      db.vendors.bulkPut(data[3])
    })

  },[])


  return <DropdownContext.Provider value={{ ...dropdown, set: setDropdownValue } } >
  
    <Routes>
    {AppRoutes.map((route, index) => {
      const { element, ...rest } = route;
      return <Route key={index} {...rest} element={element} />;
    })}
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
            <TheApp />
          </QueryClientProvider>
        </LocalizationProvider>
      </Layout>
    );
  }
}
