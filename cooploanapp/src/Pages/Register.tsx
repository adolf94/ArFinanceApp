import { useEffect, useState } from "react"
import { Box, Button, CircularProgress, Grid2 as Grid, InputAdornment, TextField, Typography } from "@mui/material"
import { enqueueSnackbar } from 'notistack'
import { oauthSignIn } from "../components/googlelogin"
import api from "../components/api"
import { jwtDecode, JwtPayload } from "jwt-decode"
import moment from "moment"


export interface IdToken extends JwtPayload {
		email: string,
		name :string ,
		userId?: string,
		role: string[] | string
}

interface SmsOtpButtonProps {
		requestOtp: () => void,
		nextOtp: moment.Moment
}

const SmsOtpButton = ({ requestOtp, nextOtp }: SmsOtpButtonProps) => {

		const [remaining, setRemaining] = useState(0)
		const [disabled, setDisabled] = useState(false)

		useEffect(() => {
				if (moment().isBefore(nextOtp)) setDisabled(true)
				const interval = setInterval(() => {
						setRemaining(nextOtp.diff(moment(), 'seconds'))
						if (moment().isAfter(nextOtp)) {
								clearInterval(interval)
								setRemaining(0)
								setDisabled(false)
						}
				},900)

				return ()=>clearInterval(interval)
		}, [nextOtp])



		return <Button onClick={requestOtp} disabled={ disabled }>
				{
						disabled&&(remaining>0) ? "Resend in "	+ remaining :	"Send OTP"
				}
				</Button>
}

const Register = ({ token }: {token: string}) => {
		const [form, setForm] = useState({
				name: '',
				userName: '',
				mobileNumber: '',
				otpGuid: '',
				otpCode:''
		})

		const [otpState, setOtpState] = useState(moment())


		useEffect(() => {
				if(!token) return
				try {
						const jsonToken = jwtDecode<IdToken>(token)
						if (jsonToken) {
								setForm((form) => ({
										...form,
										name: jsonToken.name,
										userName: jsonToken.email
								}))
						}
				} catch (ex) { /* empty */ }

		},[token])

		


		const registerClicked = () => {
				const { name, userName, mobileNumber} = form
				if (!name || !userName || !mobileNumber) {
						enqueueSnackbar("Please check your provided inputs", { autoHideDuration: 3000, anchorOrigin: {horizontal:'right', vertical:'bottom'} ,variant: 'error' })
						return
				}
				api.post("/user", form)
						.then(() => {
								oauthSignIn();
						}).catch(err => {

								if (err.response.status == 400) {
										switch (err.response.data.result) {
												case -2:
														enqueueSnackbar("Incorrect OTP, please try again", { autoHideDuration: 3000, anchorOrigin: { horizontal: 'right', vertical: 'bottom' }, variant: 'error' })
														break;
												case -1:
												case 0:
										}
								}
						})

		}

		const requestOtp = () => {
				const nextSms = moment().add(90, "seconds");
				setOtpState(nextSms)
				api.post("/otp", { mobileNumber: form.mobileNumber })
						.then(e => {
								enqueueSnackbar("We've sent an OTP to your provided number", { autoHideDuration: 3000, anchorOrigin: {horizontal:'right', vertical:'bottom'} ,variant: 'success' })
								setForm({ ...form, otpGuid: e.data.id})
						}).catch(err => {
								if (!err.response) {
										setOtpState(moment())
								}
								if (err.response.status == 429) {
										enqueueSnackbar("You've already requested too much OTP! Please wait!", { autoHideDuration: 3000, anchorOrigin: {horizontal:'right', vertical:'bottom'} ,variant: 'error' })
								}
						});
		}


		return <Box sx={{ p: 3 }}>
				<Box sx={{pb:2}}>
						<Typography variant="h5">Complete your registration</Typography>
				</Box>
				<Box sx={{ pb: 2 }}>
						<TextField label="Name" value={form.name} fullWidth onChange={(evt)=> setForm({ ...form, name: evt.target.value })} />
				</Box>
				<Box sx={{ pb: 2 }}>
						<TextField label="Email" value={form.userName } fullWidth />
				</Box>
				<Box sx={{ pb: 2 }}>
						<TextField label="Mobile Number" value={form.mobileNumber} fullWidth
								slotProps={{
										input: {
												startAdornment: (
														<InputAdornment position="start">
																+63
														</InputAdornment>
												),
										},
								}}
								onBlur={evt => {
										const len = evt.target.value.length;
										const number = len <= 10 ? evt.target.value : evt.target.value.substring(len - 10);
										setForm({ ...form, mobileNumber: number })

								}}
								onChange={evt => setForm({ ...form, mobileNumber: evt.target.value })}
						/>

				</Box>
				<Box sx={{ pb: 2 }}>
						<TextField label="OTP Code" value={form.otpCode} fullWidth
								onChange={evt => setForm({ ...form, otpCode: evt.target.value })}
								slotProps={{
										input: {
												endAdornment: (
														<InputAdornment position="end">
																<SmsOtpButton requestOtp={requestOtp} nextOtp={otpState} />
														</InputAdornment>
												),
										},
								}}
						/>
				</Box>
				<Box sx={{ p: 2 }}>
						You will be using your Google Account to login
				</Box>
				<Box sx={{ pb: 2 }}>
						<Button fullWidth variant="contained" size="large" onClick={registerClicked}> Sign Up </Button>
				</Box>
		</Box>


}

export default Register