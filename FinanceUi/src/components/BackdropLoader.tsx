import { Backdrop, CircularProgress } from "@mui/material"



const BackdropLoader = ()=>{



    return <Backdrop
    open
    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
    >
        <CircularProgress color="inherit" />
    </Backdrop>
}

export default BackdropLoader