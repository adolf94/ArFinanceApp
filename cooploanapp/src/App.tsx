import { lazy, useState } from 'react'
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import  Index  from "./Pages/Index"
import  Admin from './Pages/Admin'
import { UserContext } from './components/userContext'
import { SnackbarProvider, enqueueSnackbar } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'


function App() {

    const router = createBrowserRouter([
        { path: "/", element: <Index /> },
        { path: "/admin", element: <Admin /> }

    ], {basename: "/loans"})
    const [userctx, setUserCtx] = useState({})



    return (

        <LocalizationProvider dateAdapter={AdapterMoment}>

        <UserContext.Provider value={{ get: userctx, set: setUserCtx }}>
            <SnackbarProvider />

              <RouterProvider router={ router } />
            </UserContext.Provider>
        </LocalizationProvider>
  )
}

export default App
