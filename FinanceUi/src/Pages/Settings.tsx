import { BookOnline, TableChart } from "@mui/icons-material"
import { AppBar, Container, Grid, IconButton, Toolbar, Typography } from "@mui/material"
import db from "../components/LocalDb";
import { useConfirm } from "material-ui-confirm";
import { useQueryClient } from "@tanstack/react-query";



const Settings = () => {


		const confirm = useConfirm();
		const queryClient = useQueryClient()

		const resetDb = () => {
				confirm({ description: "Are you sure you want to delete the Local Db?", title:"Confirm" })
						.then(() => {
							db.delete()
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

				<Grid container sx={{ pt: 3 } }>
						<Grid item xs={4} sx={{textAlign:"center" } }>
								<IconButton onClick={resetCache}>
										<BookOnline sx={{fontSize:"3rem"} } />
								</IconButton><br />
								Reset Local Cache

						</Grid>
						<Grid item xs={4} sx={{ textAlign: "center" }}>
								<IconButton onClick={resetDb }>
										<TableChart sx={{ fontSize: "3rem" }} />
								</IconButton><br />
								Reset Local Database
						</Grid>
				</Grid>
		</>
}

export default Settings;