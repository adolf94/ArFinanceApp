import { Box, Card, CardContent, Grid2 as Grid, Typography } from "@mui/material"
import AuthenticatedLayout from "../components/AuthenticatedLayout"
import { PersonAdd } from "@mui/icons-material"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons'
import CreateLoanProfile from "./AdminComponents/CreateLoanProfile"


const Admin = () => {


	
		return <AuthenticatedLayout persona="admin">
				<Grid container sx={{ width: '100vw' }}>
						<Grid container sx={{ width: '100vw', pt: 5 }}>
								<Grid size={{ lg: 3, md: 4, xs: 12 }} sx={{ p: 2 }}>
										<Card>
												<CardContent>
														<Grid container>
																<Grid size={4} sx={{ textAlign: 'center' }}>
																		<Box>
																				<PersonAdd sx={{ fontSize: '3rem' }} />
																		</Box>
																</Grid>
																<Grid size={8}>
																		<Typography variant="h5">Add a user</Typography>
																</Grid>
														</Grid>
												</CardContent>
										</Card>
								</Grid>
								<Grid size={{ lg: 3, md: 4, xs: 12 }} sx={{ p: 2 }}>
										<Card>
												<CardContent>
														<Grid container>
																<Grid size={4} sx={{ textAlign: 'center', fontSize: '3rem' }} >
																		<Box>
																				<FontAwesomeIcon icon={faHandHoldingDollar} />
																		</Box>
																</Grid>
																<Grid size={8}>
																		<Typography variant="h5">Release a loan</Typography>
																</Grid>
														</Grid>
												</CardContent>
										</Card>
								</Grid>

						</Grid>
						<Grid container sx={{ pt: 2, width:'100vw' }}>
								<Grid size={6} > 
										<CreateLoanProfile />
								</Grid>
						</Grid>
				</Grid>
		</AuthenticatedLayout>

}


export default Admin