import { AppBar, Box, Button, Card, CardContent, Dialog, Grid2 as Grid, Grid2, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { CardTitle } from "reactstrap"
import { useState } from "react"
import NewPasskeyDialog from "./NewPasskeyDialog"


const SecuritySettings = ()=>{
    const [show,setShow] = useState(true)


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
                                <NewPasskeyDialog />
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
                                            DateCreated
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    
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