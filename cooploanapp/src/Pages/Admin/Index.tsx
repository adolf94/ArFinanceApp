import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Grid2 as Grid,
	Typography,
} from "@mui/material";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { PersonAdd } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";
import CreateUser from "./User/CreateUser";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import CreateLoan from "./Loan/Create";
import AdminBody from "./Loan/AdminBody";
import CreatePayment from "./Payments/CreatePayment";
import EditUser from "./User/EditUser";

const Admin = () => {
	const navigate = useNavigate();

	return (
		<AuthenticatedLayout persona="admin"  roles={["MANAGE_LOAN"]}>
			<Grid container sx={{ width: "100vw" }}>
				<Grid container sx={{ width: "100vw", pt: 5 }}>
					<Grid size={{ lg: 3, md: 4, xs: 12 }} sx={{ p: 2 }}>
						<Card>
							<CardContent>
								<Grid container>
									<Grid size={4} sx={{ textAlign: "center" }}>
										<Box>
											<PersonAdd sx={{ fontSize: "3rem" }} />
										</Box>
									</Grid>
									<Grid
										size={8}
										sx={{ cursor: "pointer" }}
										onClick={() => navigate("./user/new")}
									>
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
									<Grid size={4} sx={{ textAlign: "center", fontSize: "3rem" }}>
										<Box>
											<FontAwesomeIcon icon={faHandHoldingDollar} />
										</Box>
									</Grid>
									<Grid
										size={8}
										sx={{ cursor: "pointer" }}
										onClick={() => navigate("./loan/new")}
									>
										<Typography variant="h5">Issue a loan</Typography>
									</Grid>
								</Grid>
							</CardContent>
							<CardActions>
								<Button onClick={() => navigate("./payment/new")}>Record payment</Button>
							</CardActions>
						</Card>
					</Grid>
				</Grid>
				<Grid container sx={{ pt: 2, width: "100vw" }}>
					
					<AdminBody />
				</Grid>
			</Grid>
			<Routes>
				<Route path="/user/new" element={<CreateUser />}></Route>
				<Route path="/user/:userId" element={<EditUser />}></Route>
				<Route path="/payment/new" element={<CreatePayment />}></Route>
				<Route path="/loan/new" element={<CreateLoan />}></Route>
				<Route path="*" element={<Outlet />}></Route>
			</Routes>
		</AuthenticatedLayout>
	);
};

export default Admin;
