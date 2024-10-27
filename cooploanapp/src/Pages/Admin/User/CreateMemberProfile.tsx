import { Button, Dialog, DialogActions, DialogContent, Grid2 as Grid, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from "@mui/material"
import { COOP_OPTION, getOptionByYear } from "../../../repositories/coopOption"
import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import { useState } from "react"
import { Add, Remove } from "@mui/icons-material"
import { FormattedAmount } from "../../../components/NumberInput"
import { useMutateMemberProfile } from "../../../repositories/memberProfile"
import {useConfirm} from 'material-ui-confirm'
import { enqueueSnackbar } from "notistack"

interface CreateMemberProfileProps {
    user : any,
    year: number,
    onClose : ()=>void
}

const CreateMemberProfile = (props: CreateMemberProfileProps) =>{

    const {data: option} = useQuery({
        queryKey: [COOP_OPTION,{year:props.year}],
         queryFn:()=>getOptionByYear(props.year),
         retry:false,
         staleTime: 600000,
         gcTime: 24*60*60*1000
      })
      const confirm = useConfirm()
    const {create} = useMutateMemberProfile()
    const [count, setCount] = useState(0)


    const adjust = (val : number)=>{

        let newValue = count + val
        if(newValue > 30 || newValue < 1) return
        setCount(newValue)
    }


    const Save = ()=>{

        confirm({description: `You are about to enroll ${props.user.name} to the coop. Are you sure?`, confirmationText: "Enroll User"})
            .then(()=>{
                return create.mutateAsync({
                    year:props.year,
                    userId:props.user.id,
                    shares:count
                }).then(()=>{
                    props.onClose();
                    enqueueSnackbar("User successfully enrolled!", {variant:'success'})
                })

            })
    }

    return <Dialog open maxWidth="sm"  onClose={props.onClose}>
        <DialogContent>
            <Grid container sx={{width:'100%'}}>
                <Grid size={12}></Grid>
                <Grid size={12}>

                </Grid>
                <Grid size={12}>
                    <TableContainer>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell sx={{textAlign:'center'}}>{props.user.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>No of shares/heads</TableCell>
                                    <TableCell >
                                    <TextField size="small"
                                        sx={{input:{textAlign:'center'}}}
                                        slotProps={{
                                            input: {
                                                    endAdornment: (
                                                            <InputAdornment position="end">
                                                                    <IconButton size="small" onClick={()=>adjust(+1)}>
                                                                        <Add />
                                                                    </IconButton>
                                                                    <IconButton size="small" onClick={()=>adjust(-1)}>
                                                                        <Remove />
                                                                    </IconButton>
                                                            </InputAdornment>
                                                    ),
                                            },
                                        }}
                                        value={count} />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Amount per installment</TableCell>
                                    <TableCell sx={{textAlign:'center'}}>{FormattedAmount(option?.initialAmount * count)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Count of installments</TableCell>
                                    <TableCell sx={{textAlign:'center'}}>{option?.installmentCount}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Total Amount afterwards</TableCell>
                                    <TableCell sx={{textAlign:'center'}}>{FormattedAmount(option?.installmentCount * option?.initialAmount * count)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>First Contribution/Money down</TableCell>
                                    <TableCell sx={{textAlign:'center'}}>{moment(option?.firstInstallment).format("MMM DD,YYYY")}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" sx={{minWidth:'100px'}} disabled={count==0 || create.isPending} onClick={Save}>Add</Button>
        </DialogActions>
    </Dialog>
}

export default CreateMemberProfile