import {
	Card, CardContent, CardActions, Chip, Grid2 as Grid, Paper, Table, TableBody,
	TableCell, TableContainer, TableHead, TableRow, Typography, Button,
	Box
} from "@mui/material"
import AuthenticatedLayout from "../../components/AuthenticatedLayout"
import { AccountBalance, GridView, ViewList, VolunteerActivism } from '@mui/icons-material'
import { useEffect, useState } from "react"
import useUserInfo from "../../components/userContext"
import { getByUserId, LOAN } from "../../repositories/loan"
import { useQuery } from "@tanstack/react-query"
import { FormattedAmount } from "../../components/NumberInput"
import moment from "moment"
import { Outlet, Route, Routes, useNavigate } from "react-router-dom"
import ViewLoanAsBorrower from "./Loans/View"

const IndexAuthenticated = () => {
		const { user } = useUserInfo();
		const navigate = useNavigate();
	const { data: loans, isLoading: loading } = useQuery({ queryKey: [LOAN, { userId: user.userId }], queryFn: () => getByUserId(user.userId!) })
	const [view, setView] = useState("tiles")
	const [total, setTotal] = useState<any>({})
	const [loanCalculation, setLoanCalculated] = useState<any>([])

	useEffect(() => {

		let total = {
			principal: 0,
			interest: 0,
			payments: 0,
			balance: 0,
			lastPayment: null
		}

		let loansCalculated = (loans || []).map((l: any) => {
			let payments = l.payment.reduce((p: number, c: any) => { return Number.parseFloat(c.amount) + p }, 0)
			let interest = l.interestRecords.reduce((p: number, c: any) => { return Number.parseFloat(c.amount) + p }, 0)
			total.principal = total.principal + Number.parseFloat(l.principal);
			total.interest = total.interest + interest;
			total.payments = total.payments + Number.parseFloat(payments);
			total.lastPayment = l.payment.reduce((p,c)=>{
				if(p===null) return c;
				if(p.date < c.date ) return {...c};
				if(p.paymentId == c.paymentId) p.amount = p.amount + c.amount;
				return p;
			  },null)
			let res = {
				date: l.date,
				principal: l.principal,
				interests: interest,
				payments: payments,
				balance: l.principal + interest - Number.parseFloat(payments),
				orig: l
			}
			return res
		})
		setLoanCalculated(loansCalculated)
		setTotal({ ...total, balance: total.interest + total.principal - total.payments })

	}, [loans])


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
								P {FormattedAmount(total.balance)}
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
									P {FormattedAmount(total.lastPayment?.amount || 0)}
								</Typography>
								<Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
									{total.lastPayment?moment(total.lastPayment.date).format("MMMM DD"):"No payments yet"}
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
					{loanCalculation.map(loan=>
					<Grid size={{ xl: 4, md: 6, xs: 12 }} sx={{ p: 1 }} key={loan.orig.id}>
						<Card>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								{/*<CardContent sx={{}}>*/}
								<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>
									<Box>
										<Typography variant="h5" component="div" gutterBottom={false}>
											P {FormattedAmount(loan.balance)}
										</Typography>
									</Box>
									<Typography variant="subtitle1" sx={{ color: 'text.secondary' }} component="div" gutterBottom={false}>
										Due: {moment(loan.nextInterest).format("MMM DD")}
									</Typography>
								</Grid>
								<Grid sx={{ pb: 1, justifyContent:'start' }}>
									<Grid sx={{display:'flex',flexWrap:'wrap'}}>
										<Box sx={{textAlign:'center'}}>
											<Chip size="small" color="primary" label={`Principal: ${FormattedAmount(loan.principal)}`}  />
											<Chip size="small" color="warning" label={`Interest: ${FormattedAmount(loan.interests)}`}  />
											<Chip size="small" color="success" label={`Payments: ${FormattedAmount(loan.payments)}`}  />
										</Box>
									</Grid>
								</Grid>
							</CardContent>
							<CardActions sx={{ justifyContent: 'end' }}>
													<Button onClick={() => navigate("./loan/" + loan.orig.id)}> More Details </Button>
							</CardActions>
						</Card>
					</Grid>)}


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

			<Routes>
				<Route path="/payment/:paymentId" element={<Outlet />}></Route>
				<Route path="loan/:loanId" element={<ViewLoanAsBorrower />}></Route>
				<Route path="*" element={<Outlet />}></Route>
			</Routes>

		</Grid>
	</AuthenticatedLayout>
}

export default IndexAuthenticated