import {
	Card, CardContent, CardActions, Chip, Grid2 as Grid, Paper, Table, TableBody,
	TableCell, TableContainer, TableHead, TableRow, Typography, Button,
	Box,
    IconButton
} from "@mui/material"
import AuthenticatedLayout from "../../components/AuthenticatedLayout"
import { AccountBalance, ExpandMore, GridView, ViewList, VolunteerActivism } from '@mui/icons-material'
import { useEffect, useState } from "react"
import useUserInfo from "../../components/userContext"
import { getByUserId, LOAN } from "../../repositories/loan"
import { useQuery } from "@tanstack/react-query"
import { FormattedAmount } from "../../components/NumberInput"
import moment from "moment"
import { Outlet, Route, Routes, useNavigate } from "react-router-dom"
import ViewLoanAsBorrower from "./Loans/View"
import {Loan, LoanPayment, PaymentPlan} from "FinanceApi";
import {generateCompute} from "../../components/useComputeInterest";

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
			lastPayment: null as LoanPayment | null,
			nextPayment: null as PaymentPlan | null | undefined 
		}

		let loansCalculated = (loans || []).map((l: Loan) => {
			let payments = l.payment.reduce((p: number, c: any) => { return Number.parseFloat(c.amount) + p }, 0)
			let interest = l.interestRecords.reduce((p: number, c: any) => { return Number.parseFloat(c.amount) + p }, 0)

			let principalBalance =  l.payment.reduce((p: number,c:LoanPayment)=>{return  p - (c.againstPrincipal? c.amount: 0)},l.principal)
			let balance = l.principal + interest - payments
			if(l.loanProfile.computePerDay) {
				const computeInterest = generateCompute({date: moment(l.date), principal:l.principal}, l.loanProfile)

				let interestOut = computeInterest(moment(), {
					date: moment(),
					balance: balance,
					totalInterestPercent:l.totalInterestPercent,
					interest:interest,
					principal:principalBalance
				})

				principalBalance = balance  - interestOut.amount;
				interest = interest - interestOut.amount
			}




			total.principal = total.principal + l.principal;
			total.interest = total.interest + interest;
			total.payments = total.payments + payments;
			total.lastPayment = l.payment.reduce((p : LoanPayment | null,c)=>{
				if(p===null) return c;
				if(p.date < c.date ) return {...c};
				if(p.paymentId == c.paymentId) p.amount = p.amount + c.amount;
				return p;
			  },null)
			
			let nextPayment = l.expectedPayments.sort((a,b)=>a.date.localeCompare(b.date))
				.find(e=>moment(e.date).isAfter(moment()))
			let res = {
				date: l.date,
				principal: l.principal,
				interests: interest,
				payments: payments,
				nextPayment,
				balance: principalBalance,
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
					{loanCalculation.map((loan:any)=>
					<Grid size={{ xl: 3, lg:4, md: 6, xs: 12 }} sx={{ p: 1 }} key={loan.orig.id}>
						<Card onClick={() => navigate("./loan/" + loan.orig.id)}>
							<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>
								<Grid container direction="column">
									<Grid container sx={{justifyContent:'space-between'}}>
								
										<Typography variant="caption" sx={{fontWeight:"bold",pt:1}} gutterBottom={false}>
											Date Created: {moment(loan.date).format("MMM DD")}
										</Typography>
										<Grid>
											<IconButton>
												<ExpandMore fontSize="small" />
											</IconButton>
										</Grid>
									</Grid>
									
									<Typography variant="caption" gutterBottom={false}>
										Principal: {FormattedAmount(loan.principal)}
									</Typography>
									<Typography variant="caption" gutterBottom={false}>
										Interest: {FormattedAmount(loan.interests)}
									</Typography>
									<Typography variant="caption" gutterBottom={false}>
										Payments: {FormattedAmount(loan.payments)}
									</Typography>
									<Grid container  sx={{pt:1, justifyContent:'space-between'}}>
										<Grid container direction="column"	>
											<Typography variant="h5" gutterBottom={false}>
												{FormattedAmount(loan.nextPayment?.amount)}
											</Typography>
											<Typography variant="caption" gutterBottom={false}>
												Next Payment
											</Typography>
											<Typography variant="caption" gutterBottom={false}>
												Before {moment(loan.nextPayment?.date).format("MMM DD")}
											</Typography>
											
										</Grid>
										<Grid>
											<Typography variant="h5" sx={{textWeight:'bold',textAlign:'right'}} gutterBottom={false}>
												{FormattedAmount(loan.balance)}
											</Typography>
											<Typography variant="caption" sx={{textAlign:'right'}} gutterBottom={false}>
												Outstanding Balance
											</Typography>
										</Grid>
									</Grid>
								</Grid>
								
							</CardContent>
						</Card>
						
						{/*<Card>*/}
						{/*	<CardContent sx={{ p: 2, paddingBottom: '8px!important' }}>*/}
						{/*		/!*<CardContent sx={{}}>*!/*/}
						{/*		<Grid container sx={{ justifyContent: "space-between", pb: 1 }}>*/}
						{/*			<Box>*/}
						{/*				<Typography variant="caption" gutterBottom={false}>*/}
						{/*					Date Created: {moment(loan.date).format("MMM DD")}*/}
						{/*				</Typography>*/}
						{/*				<Typography variant="h5" component="div" gutterBottom={false}>*/}
						{/*					P {FormattedAmount(loan.balance)}*/}
						{/*				</Typography>*/}
						{/*				<Typography variant="caption" gutterBottom={false}>*/}
						{/*					Balance*/}
						{/*				</Typography>*/}
						{/*			</Box>*/}
						{/*			<Box>*/}
						{/*				*/}
						{/*				/!*Due: {moment(loan.nextInterest).format("MMM DD")}*!/*/}
						
						{/*				<Typography variant="caption" gutterBottom={false}>*/}
						{/*					Next Payment*/}
						{/*				</Typography>*/}
						{/*				<Typography variant="h5" gutterBottom={false}>*/}
						{/*					{FormattedAmount(loan.nextPayment?.amount)}*/}
						{/*				</Typography>*/}
						{/*				<Typography variant="caption" gutterBottom={false}>*/}
						{/*					Before {moment(loan.nextPayment?.date).format("MMM DD")}*/}
						
						{/*				</Typography>*/}
						{/*			</Box>*/}
						{/*		</Grid>*/}
						{/*		<Grid sx={{ pb: 1, justifyContent:'start' }}>*/}
						{/*			<Grid sx={{display:'flex',flexWrap:'wrap'}}>*/}
						{/*				<Box sx={{textAlign:'center'}}>*/}
						{/*					<Chip size="small" color="primary" label={`Principal: ${FormattedAmount(loan.principal)}`}  />*/}
						{/*					<Chip size="small" color="warning" label={`Interest: ${FormattedAmount(loan.interests)}`}  />*/}
						{/*					<Chip size="small" color="success" label={`Payments: ${FormattedAmount(loan.payments)}`}  />*/}
						{/*				</Box>*/}
						{/*			</Grid>*/}
						{/*			<Grid>*/}
						{/*			</Grid>*/}
						{/*		</Grid>*/}
						{/*	</CardContent>*/}
						{/*	<CardActions sx={{ justifyContent: 'end' }}>*/}
						{/*							<Button onClick={() => navigate("./loan/" + loan.orig.id)}> More Details </Button>*/}
						{/*	</CardActions>*/}
						{/*</Card>*/}
						
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
								{
									loanCalculation.map((loan : any )=><TableRow key={loan.id}>
										<TableCell align="center">{moment(loan.date).format("YYYY-MM-DD")}</TableCell>
										<TableCell align="right">{FormattedAmount(loan.principal)}</TableCell>
										<TableCell align="right">{FormattedAmount(loan.interests)}</TableCell>
										<TableCell align="right">
											<Typography sx={{ fontWeight: 'bold' }} color="success"> {FormattedAmount(loan.payments)} </Typography>
										</TableCell>
										<TableCell align="right">
											<Typography sx={{ fontWeight: 'bold' }} color="error"> {FormattedAmount(loan.balance)} </Typography>
										</TableCell>
										<TableCell align="center">Pending</TableCell>
										<TableCell align="center"><Button variant="outlined" onClick={() => navigate("./loan/" + loan.orig.id)}>
												View
											</Button>
										</TableCell>

									</TableRow>)
								}

							</TableBody>
						</Table>
					</TableContainer>
				</Grid>
			}

			<Routes>
				<Route path="/payment/:paymentId" element={<Outlet />}></Route>
				<Route path="/loan/:loanId" element={<ViewLoanAsBorrower />}></Route>
				<Route path="*" element={<Outlet />}></Route>
			</Routes>

		</Grid>
	</AuthenticatedLayout>
}

export default IndexAuthenticated