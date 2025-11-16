import { AppBar, Box, Button, Card, CardContent, Dialog, Grid2 as Grid, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { CardTitle } from "reactstrap"
import { useEffect, useState } from "react"
import NewPasskeyDialog from "./NewPasskeyDialog"
import api from "../../components/fnApi"
import moment from "moment"


const SecuritySettings = ()=>{
    const [show,setShow] = useState(true)
    const [creds,setCreds] = useState([])

    const refreshCredentials = ()=>api.get("/auth/fido/credentials")
    .then(e=>{
        setCreds(e.data)
    })
    useEffect(()=>{
        refreshCredentials()
    },[])


    return <><AppBar position="static">
        <Toolbar>
            <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                Security
            </Typography>
        </Toolbar>
    </AppBar>
    <Grid container sx={{width:"100%", justifyContent:"center"}}>
        <Grid size={{xs:12,md:8}}>
            <Box sx={{py:1}}>

                <Card sx={{p:2}}>
                    <CardTitle>
                        <Typography variant="h6">Sessions</Typography>
                    </CardTitle>
                    <CardContent>

                    </CardContent>
                </Card>
            </Box>
            <Box sx={{py:1}}>
                <Card sx={{p:2}}>
                    <CardTitle>
                        <Grid2 container sx={{justifyContent:"space-between"}}>
                            <Box>
                                <Typography variant="h6">Security Keys</Typography>
                            </Box>
                            <Box>
                                <NewPasskeyDialog onComplete={refreshCredentials}/>
                            </Box>
                        </Grid2>
                    </CardTitle>
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            Alias
                                        </TableCell>
                                        <TableCell>
                                            Device
                                        </TableCell>
                                        <TableCell>
                                            DateCreated
                                        </TableCell>
                                        <TableCell>
                                            
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {creds.map(e=><TableRow>
                                        <TableCell>
                                            {e.nickname}
                                        </TableCell>
                                        <TableCell>
                                            {e.device}
                                        </TableCell>
                                        <TableCell>
                                            {moment(e.createdAt).format("YYYY-MM-DD")}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="warning" size="small"> Revoke / Delete </Button>
                                        </TableCell>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </Grid>
    </Grid>
        </>
}

export default SecuritySettings