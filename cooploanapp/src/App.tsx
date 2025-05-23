import { useState } from 'react'
import { createBrowserRouter,   RouterProvider } from 'react-router-dom'
import  Index  from "./Pages/Index"
import  Admin from './Pages/Admin/Index'
import { UserContext } from './components/userContext'
import { SnackbarProvider } from 'notistack'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { IdToken } from './Pages/Register'
import { ConfirmProvider } from 'material-ui-confirm'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import MemberPage from './Pages/Member/Index'
import { GoogleOAuthProvider } from '@react-oauth/google'
import GetTokenProvider from "./components/GetTokenProvider";


export const queryClient = new QueryClient({defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false 
        },
        mutations :{
            retry:false
        }
    }})
function App() {

    const router = createBrowserRouter([
        { path: "/*", element: <Index /> },
        { path: "/member/*", element: <MemberPage /> },
        { path: "/admin/*", element: <Admin /> }

    ], {basename: import.meta.env.BASE_URL})
    const [userctx, setUserCtx] = useState<IdToken>(null as any)

    const userContextValue = { get: userctx, set: setUserCtx }

    return (
        <ConfirmProvider>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <QueryClientProvider client={queryClient}>
                    {/* //@ts-ignore */}
                    <GoogleOAuthProvider clientId={window.webConfig.clientId}>

                        <UserContext.Provider value={userContextValue}>
                            <SnackbarProvider />
                            <GetTokenProvider />
                        <RouterProvider router={ router } />
                    </UserContext.Provider>
                    <ReactQueryDevtools
                    initialIsOpen={false}
                    buttonPosition="bottom-left"
                    />
                    </GoogleOAuthProvider>
                </QueryClientProvider>
            </LocalizationProvider>
        </ConfirmProvider>
  )
}

export default App
