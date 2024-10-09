import { lazy, useState } from 'react'
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import  Index  from "./Pages/Index"
import  Admin from './Pages/Admin/Index'
import { UserContext } from './components/userContext'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { IdToken } from './Pages/Register'


export const queryClient = new QueryClient()
function App() {

    const router = createBrowserRouter([
        { path: "/", element: <Index /> },
        { path: "/admin/*", element: <Admin /> }

    ], {basename: "/loans"})
    const [userctx, setUserCtx] = useState<IdToken>(null as any)



    return (

        <LocalizationProvider dateAdapter={AdapterMoment}>
            <QueryClientProvider client={queryClient}>
                <UserContext.Provider value={{ get: userctx, set: setUserCtx }}>
                    <SnackbarProvider />

                      <RouterProvider router={ router } />
                </UserContext.Provider>
            </QueryClientProvider>
        </LocalizationProvider>
  )
}

export default App
