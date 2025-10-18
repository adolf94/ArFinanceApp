import { BookOnline, Collections, TableChart } from "@mui/icons-material"
import { AppBar, Box, Container, Grid2 as Grid, IconButton, Toolbar, Typography } from "@mui/material"
import db from "../components/LocalDb";
import { useConfirm } from "material-ui-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { initializeDb } from "../components/LocalDb/AppDb";



const Settings = () => {


		const confirm = useConfirm();
		const queryClient = useQueryClient()
		const navigate = useNavigate()

		const resetDb = () => {
				confirm({ description: "Are you sure you want to delete the Local Db?", title:"Confirm" })
						.then(() => {
							db.delete()
							initializeDb()
							db.open()
						})
						

		}

		const resetCache = () => {

				confirm({ description: "Are you sure you want to delete the Local Cache?", title: "Confirm" })
						.then(() => {
								queryClient.clear()
						})

		}


    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                    Settings
                </Typography>
            </Toolbar>
        </AppBar>
			<Box sx={{width:"100%"}}>
				<Grid container sx={{ pt: 3 } }>
						<Grid size={4} sx={{textAlign:"center", py:2 } }>
								<IconButton onClick={resetCache}>
										<BookOnline sx={{fontSize:"3rem"} } />
								</IconButton><br />
								Reset Local Cache

						</Grid>
						<Grid size={4} sx={{ textAlign: "center", py:2 }}>
								<IconButton onClick={resetDb }>
										<TableChart sx={{ fontSize: "3rem" }} />
								</IconButton><br />
								Reset Local Database
						</Grid>
						<Grid size={4} sx={{ textAlign: "center", py:2 }}>
								<IconButton onClick={()=>navigate("./hooks") }>
										<TableChart sx={{ fontSize: "3rem" }} />
								</IconButton><br />
								Hooks Configuration
						</Grid>
						<Grid size={4} sx={{ textAlign: "center", py:2 }}>
							<IconButton onClick={()=>navigate("../images")}>
								<Collections sx={{ fontSize: "3rem" }} />
							</IconButton><br />
							Images
						</Grid>
				</Grid>
			</Box>
		</>
}

export default Settings;