import {
	Card, CardContent, CardActions, Chip, Grid2 as Grid, Paper, Table, TableBody,
	TableCell, TableContainer, TableHead, TableRow, Typography, Button,
	Box
} from "@mui/material"
import AuthenticatedLayout from "../components/AuthenticatedLayout"
import { AccountBalance, GridView, ViewList, VolunteerActivism } from '@mui/icons-material'
import { useState } from "react"

const IndexAuthenticated = () => {

	const [view, setView] = useState("tiles")

	return <AuthenticatedLayout persona="Borrower" >
		<Grid container sx={{ width: '100vw', pt: 2 }}>
			<Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ p: 2 }}>
				<Paper>
					<CardContent>
						<Grid container>
							<Grid size={3} >
								<AccountBalance sx={{ fontSize: '4rem', alignSelf: 'center' }} />
							</Grid>
							<Grid size={9} sx={{ textAlign: 'center', pr: 3 }}>
								<Typography gutterBottom variant="h5" component="div">
									Php 5,000.00
								</Typography>
								<Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
									Outstanding Balance
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Paper>
			</Grid>
			<Grid size={{ lg: 4, sm: 6, xs: 12 }} sx={{ pt: 3, p: 2 }}>
				<Paper>
					<CardContent>
						<Grid container>
							<Grid size={3} >
								<VolunteerActivism sx={{ fontSize: '4rem', alignSelf: 'center' }} />
							</Grid>
							<Grid size={9} sx={{ textAlign: 'center', pr: 3 }}>
								<Typography gutterBottom variant="h5" component="div">
									Php 5,000.00
								</Typography>
								<Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
									Last Payment : Sept 24,2024
								</Typography>
							</Grid>
						</Grid>
					</CardContent>
				</Paper>
			</Grid>
			<Grid container size={12} sx={{ justifyContent: 'space-between', p: 2 }} >
				<Grid>
					Filter
				</Grid>
				<Grid >
					<Button color="primary" variant={view !== "tiles" ? "contained" : "outlined"} onClick={() => setView("list")}>
						<ViewList />
					</Button>
					<Button color="primary" variant={view !== "list" ? "contained" : "outlined"} onClick={() => setView("tiles")} >
						<GridView />
					</Button>
				</Grid>
			</Grid>
			{view === "tiles" ?
				<Grid container size={12} sx={{ p: 2 }}>
					<Grid size={{ xl: 4, md: 6, xs: 12 }} sx={{ p: 1 }}>
						<Card>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								{/*<CardContent sx={{}}>*/}
								<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>
									<Typography variant="h5" component="div" gutterBottom={false}>
										Php 5,000.00
									</Typography>
									<Typography variant="subtitle1" sx={{ color: 'text.secondary' }} component="div" gutterBottom={false}>
										Due: Sept 24
									</Typography>
								</Grid>
								<Grid sx={{ pb: 1 }}>
									<Box>
										<Chip size="small" color="primary" label="Principal: 5,000.00" />
										<Chip size="small" color="warning" label="Interests: 5,000.00" />
										<Chip size="small" color="success" label="Payments: 5,000.00" />
									</Box>

								</Grid>
							</CardContent>
							<CardActions sx={{ justifyContent: 'end' }}>
								<Button> More Details </Button>
							</CardActions>
						</Card>
					</Grid>
					<Grid size={{ xl: 4, md: 6, xs: 12 }} sx={{ p: 1 }}>
						<Card>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								{/*<CardContent sx={{}}>*/}
								<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>
									<Typography variant="h5" component="div" gutterBottom={false}>
										Php 5,000.00
									</Typography>
									<Typography variant="subtitle1" sx={{ color: 'text.secondary' }} component="div" gutterBottom={false}>
										Due: Sept 24
									</Typography>
								</Grid>
								<Grid sx={{ pb: 1 }}>
									<Box>
										<Chip size="small" color="primary" label="Principal: 5,000.00" />
										<Chip size="small" color="warning" label="Interests: 5,000.00" />
										<Chip size="small" color="success" label="Payments: 5,000.00" />
									</Box>

								</Grid>
							</CardContent>
							<CardActions sx={{ justifyContent: 'end' }}>
								<Button> More Details </Button>
							</CardActions>
						</Card>
					</Grid>
					<Grid size={{ xl: 4, md: 6, xs: 12 }} sx={{ p: 1 }}>
						<Card>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								{/*<CardContent sx={{}}>*/}
								<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>
									<Typography variant="h5" component="div" gutterBottom={false}>
										Php 5,000.00
									</Typography>
									<Typography variant="subtitle1" sx={{ color: 'text.secondary' }} component="div" gutterBottom={false}>
										Due: Sept 24
									</Typography>
								</Grid>
								<Grid sx={{ pb: 1 }}>
									<Box>
										<Chip size="small" color="primary" label="Principal: 5,000.00" />
										<Chip size="small" color="warning" label="Interests: 5,000.00" />
										<Chip size="small" color="success" label="Payments: 5,000.00" />
									</Box>

								</Grid>
							</CardContent>
							<CardActions sx={{ justifyContent: 'end' }}>
								<Button> More Details </Button>
							</CardActions>
						</Card>
					</Grid>
					<Grid size={{ xl: 4, md: 6, xs: 12 }} sx={{ p: 1 }}>
						<Card>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								{/*<CardContent sx={{}}>*/}
								<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>
									<Typography variant="h5" component="div" gutterBottom={false}>
										Php 5,000.00
									</Typography>
									<Typography variant="subtitle1" sx={{ color: 'text.secondary' }} component="div" gutterBottom={false}>
										Due: Sept 24
									</Typography>
								</Grid>
								<Grid sx={{ pb: 1 }}>
									<Box>
										<Chip size="small" color="primary" label="Principal: 5,000.00" />
										<Chip size="small" color="warning" label="Interests: 5,000.00" />
										<Chip size="small" color="success" label="Payments: 5,000.00" />
									</Box>

								</Grid>
							</CardContent>
							<CardActions sx={{ justifyContent: 'end' }}>
								<Button> More Details </Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid> :
				<Grid size={12} sx={{ p: 2 }}>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell component="th">Date Opened</TableCell>
									<TableCell align="center">Principal</TableCell>
									<TableCell align="center">Interest</TableCell>
									<TableCell align="center">Paid</TableCell>
									<TableCell align="center">Balance</TableCell>
									<TableCell align="center">Status</TableCell>
									<TableCell align="center">Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<TableRow>
									<TableCell align="center">2024-01-01</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right" >
										<Typography sx={{ fontWeight: 'bold' }} color="success"> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography sx={{ fontWeight: 'bold' }} color="red"> 100.00 </Typography>
									</TableCell>
									<TableCell align="center">Pending</TableCell>
									<TableCell align="center"></TableCell>
								</TableRow>
								<TableRow>
									<TableCell align="center">2024-01-01</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right" >
										<Typography sx={{ fontWeight: 'bold' }} color="success"> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography sx={{ fontWeight: 'bold' }} color="red"> 100.00 </Typography>
									</TableCell>
									<TableCell align="center">Pending</TableCell>
									<TableCell align="center"></TableCell>
								</TableRow>
								<TableRow>
									<TableCell align="center">2024-01-01</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right" >
										<Typography sx={{ fontWeight: 'bold' }} color="success"> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography sx={{ fontWeight: 'bold' }} color="red"> 100.00 </Typography>
									</TableCell>
									<TableCell align="center">Pending</TableCell>
									<TableCell align="center"></TableCell>
								</TableRow>
								<TableRow>
									<TableCell align="center">2024-01-01</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography> 100.00 </Typography>
									</TableCell>
									<TableCell align="right" >
										<Typography sx={{ fontWeight: 'bold' }} color="success"> 100.00 </Typography>
									</TableCell>
									<TableCell align="right">
										<Typography sx={{ fontWeight: 'bold' }} color="red"> 100.00 </Typography>
									</TableCell>
									<TableCell align="center">Pending</TableCell>
									<TableCell align="center"></TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			}
		</Grid>
	</AuthenticatedLayout>
}

export default IndexAuthenticated