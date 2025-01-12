import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2 as Grid,
    InputAdornment,
    TextField
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {getAll, LOAN_PROFILE} from "../../../repositories/loanProfiles";
import {useQuery} from "@tanstack/react-query";
import {LoanProfile, User} from "FinanceApi";
import {getUserById, useMutateUser, USER} from "../../../repositories/users";
import {v4 as uid} from 'uuid'
import {enqueueSnackbar} from "notistack";
import {useNavigate, useParams} from "react-router-dom";
import {navigate} from "../../../components/NavigateSetter";
import create from "../Loan/Create";


const defaultData = {
    userName: '',
    mobileNumber: '',
    azureId: uid(),
    googleName: "",
    name: ''
}

const EditUser = () => {

    const navigate = useNavigate()
    const {userId} = useParams()
    const {data: profiles, isLoading: loading} = useQuery<LoanProfile[]>({
        queryKey: [LOAN_PROFILE],
        queryFn: () => getAll()
    })
    const [form, setForm] = useState<Partial<User>>(defaultData)
    const {data: user, isLoading} = useQuery<User>({
            queryKey: [USER, {id: userId}],
            queryFn: () => getUserById(userId!),
            enabled: !!userId
        }
    )
    const {update} = useMutateUser();

    useEffect(() => {
        setForm(user || defaultData)
    }, [user]);

    const doCreateUser = async () => {
        if (!form.mobileNumber || !form.name) {
            enqueueSnackbar("Mobile Number / Name is required", {variant: 'error'})
            return;
        }
        if (form.mobileNumber.length != 10) {
            enqueueSnackbar("Mobile Number should have 10 digits", {variant: 'error'})
            return
        }

        update.mutateAsync(form)
            .then((res) => {
                enqueueSnackbar("User successfully Added", {variant: 'success'})
                // navigate(`../user/${res.data.id}`)
                navigate(-1)
            })
    }


    return <React.Fragment>
        <Dialog open={!isLoading} maxWidth="sm" fullWidth onClose={() => navigate(-1)}>
            <DialogTitle>Create new User</DialogTitle>
            <DialogContent>
                <Box sx={{width: '100%'}}>

                    <Grid container sx={{p: 1}}>
                        <Grid size={12} sx={{p: 1}}>
                            <TextField label="Name" fullWidth value={form.name}
                                       onChange={(evt) => setForm({...form, name: evt.target.value})}/>
                        </Grid>
                        <Grid size={12} sx={{p: 1}}>
                            <TextField label="Email" fullWidth value={form.emailAddress} onChange={(evt) => setForm({
                                ...form,
                                userName: evt.target.value,
                                emailAddress: evt.target.value
                            })}/>
                        </Grid>
                        <Grid size={12} sx={{p: 1}}>
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
                                           setForm({...form, mobileNumber: number})

                                       }}
                                       onChange={evt => setForm({...form, mobileNumber: evt.target.value})}
                            />
                        </Grid>

                        <Grid size={12} sx={{p: 1}}>
                            <Box sx={{width: '100%'}}>
                                <Autocomplete
                                    value={form.loanProfile}
                                    onChange={(_event, newValue) => {
                                        setForm({...form, loanProfile: newValue!});
                                    }}
                                    getOptionKey={e => e.profileId}
                                    getOptionLabel={e => e.loanProfileName}
                                    loading={loading}
                                    fullWidth
                                    options={profiles || []}
                                    renderInput={(params) => <TextField {...params} label="Default Loan Profile"/>}
                                />

                            </Box>
                        </Grid>

                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" disabled={update.isPending} onClick={doCreateUser}>Submit</Button>
                <Button variant="outlined" onClick={() => navigate("../")}>Cancel</Button>
            </DialogActions>
        </Dialog>
    </React.Fragment>
}

export default EditUser