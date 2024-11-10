import { Dialog, DialogTitle, DialogContent, Autocomplete, Box, Grid2 as Grid, TextField, Chip, Button} from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import React, { Suspense,  useState } from "react"
import { getAll, USER } from "../../../repositories/users"
import {CreateLoanDto, DisbursementAccount, LoanProfile, User} from 'FinanceApi'
import { LOAN_PROFILE, getAll as allProfiles } from "../../../repositories/loanProfiles"
import LoanModeler, { Payment } from "./../LoanModeler"
import { useNavigate } from "react-router-dom"
import moment from "moment"
import { useMutateLoan } from "../../../repositories/loan"
import { enqueueSnackbar } from "notistack"
import BackdropLoader from "../../../components/BackdropLoader"
import CreateDisbursementAccount from "../CreateDisbursementAccount"
import numeral from "numeral"
import LoanProfileHelperText from "./LoanProfileHelperText";

interface CreateLoanProps {

}


interface LoanForm {
    user?: User | null,
    coborrower?:  User | null,
    profile? :LoanProfile | null,
    date: moment.Moment,
    disbursementAccount: DisbursementAccount | null,
    amount: number
}



const CreateLoan = (props:CreateLoanProps) => {
    const navigate = useNavigate()
    const {data: users, isLoading: userLoading} = useQuery({queryKey:[USER], queryFn: ()=>getAll()})
    const {data: profiles, isLoading: profileLoading} = useQuery<LoanProfile[]>({
      queryKey:[LOAN_PROFILE], 
      gcTime: 86400000,
      staleTime:100000,
      queryFn: ()=>allProfiles()})
    const [payments, setPaymentData] = useState<Payment[]>([])
    const [showNewDisbursement, setShowNewDisbursement] = useState<boolean>(false)
    const {create: createLoan} = useMutateLoan()
    const [form,setForm] = useState<LoanForm>({
      amount:0,
      date: moment(),
      disbursementAccount : null
    })



    const postLoan = ()=>{
      let output : CreateLoanDto =  {
        userId: form.user!.id,
        coborrowerId:form.coborrower!.id,
        loanProfile:form.profile!,
        principal: form.amount,
        disbursementAccount: form.disbursementAccount,
        date: form.date.format("YYYY-MM-DD"),
        expectedPayments: payments.map(e=> ({
            date:moment(e.date).format("YYYY-MM-DD"),
            amount:e.amount
        }))
      }
      createLoan.mutateAsync(output)
        .then(()=>{
          navigate("../")
          enqueueSnackbar("Successfully Saved Load. Notified the user via SMS", {variant:'success'})
        })
    }



    return  <React.Fragment>
        {showNewDisbursement && <Suspense fallback={<BackdropLoader />}>
          <CreateDisbursementAccount user={form.user!} onComplete={(acct)=>{
            setForm({
              ...form,
              user: {
                ...form.user!,
                disbursementAccounts:[...form.user?.disbursementAccounts! , acct]
              }
            })
          }} onClose={()=>setShowNewDisbursement(false)}/>
        </Suspense>}
				<Dialog open={true} maxWidth="lg" fullWidth onClose={()=>navigate("../")}> 
						<DialogTitle>Add a new Loan</DialogTitle>
						<DialogContent>
              <Grid container>
                <Grid container size={{xs:12, md:4}} alignSelf="start" >
                  <Grid size={{xs:12,sm:6,md:12}} sx={{ p: 1 }}>
                        <Autocomplete
                          value={form.user}
                          onChange={(_event, newValue) => {
                                  setForm({ ...form, user: newValue! });
                          }}
                          getOptionKey={ e=>e.id}
                          getOptionLabel={e=>e?.name || ""}

                          loading={ userLoading }
                          fullWidth
                          options={users || []}
                          renderInput={(params) => <TextField {...params}  label="Client" />}
                          renderOption={(props, option) => {
                              const { key, ...optionProps } = props;
                              return (
                                <Box
                                  key={key}
                                  component="li"
                                  {...optionProps}
                                >
                                  <Box>{option.name}</Box>
                                  <Chip label={option.mobileNumber}></Chip>
                                </Box>
                              );
                            }}
                        />

                  </Grid>
                  
                  <Grid size={{xs:12,sm:6,md:12}} sx={{ p: 1 }}>
                        <Autocomplete
                          value={form.coborrower}
                          onChange={(_event, newValue) => {
                                  setForm({ ...form, coborrower: newValue! });
                          }}
                          getOptionKey={ e=>e.id}
                          getOptionLabel={e=>e?.name || ""}
                          loading={ userLoading }
                          fullWidth
                          options={users || []}
                          renderInput={(params) => <TextField {...params}  label="Coborrower / Member" />}
                          renderOption={(props, option) => {
                              const { key, ...optionProps } = props;
                              return (
                                <Box
                                  key={key}
                                  component="li"
                                  {...optionProps}
                                >
                                  <Box>{option.name}</Box>
                                  <Chip label={option.mobileNumber}></Chip>

                                </Box>
                              );
                            }}
                        />

                  </Grid>
                  
                  <Grid size={{xs:12,sm:6,md:12}} sx={{ p: 1 }}>
                        <Autocomplete
                          value={form.profile}
                          onChange={(_event, newValue) => {
                                  setForm({ ...form, profile: newValue! });
                          }}
                          getOptionKey={ e=>e.profileId}
                          getOptionLabel={e=>e.loanProfileName}
                          loading={ profileLoading }
                          fullWidth
                          options={profiles || []}
                          renderInput={(params) => <TextField {...params}
                                                              helperText={<LoanProfileHelperText loanProfile={form.profile!} /> }
                                                              label="Loan Profile" />}
                        />

                  </Grid>
                  <Grid size={{xs:12,sm:6,md:12}} sx={{ p: 1 }}>
                        <Autocomplete
                          value={form.disbursementAccount}
                          onChange={(_event, outValue ) => {
                               let  newValue = outValue as  DisbursementAccount & {createNew:boolean}

                                if(!!newValue?.createNew){
                                  setShowNewDisbursement(true)
                                  return
                                }
                               setForm({ ...form, disbursementAccount: newValue! });
                          }}
                          renderOption={(props, option) => {
                            const { key, ...optionProps } = props;
                            return (
                              <Box
                                key={key}
                                component="li"
                                {...optionProps}
                              >
                                <Box>{option.bankName}</Box> <br />
                                {option.accountName && <Chip label={option.accountName}></Chip>}
                                <Chip label={option.accountId}></Chip>

                              </Box>
                            );
                          }}
                          getOptionKey={ e=>e.accountId}
                          getOptionLabel={e=>e.bankName}
                          loading={ profileLoading }
                          fullWidth
                          options={
                            !form.user? [] :
                            [...(form.user?.disbursementAccounts || []),{createNew:true, accountId:"0",bankName:"Add new Account", accountName:"New account"}]
                          }
                          renderInput={(params ) => <TextField {...params}  
                          helperText={form.disbursementAccount? `Account: ${form.disbursementAccount.accountId} ${form.disbursementAccount.accountName && ("/ "+form.disbursementAccount.accountName)} ` : ""}
                          label="Disbursement Account" />}
                        />

                  </Grid>
                  <Grid>

                  </Grid>
                  {/* <Grid size={12} sx={{ p: 1 }}>
                    <NumberInput label="Principal / Amount to borrow" value={form.amount} onChange={(value : number)=>setForm({...form, amount:value})} />
                  </Grid> */}
                </Grid>
                <Grid size={{xs:12, md:8}}>
                  <LoanModeler loanProfile={form.profile!} onChange={(data)=>setForm({...form,date:data.date, amount:data.principal})}  onPaymentsChange={(data)=>setPaymentData(data)} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogContent sx={{textAlign:'right'}}>
                <Button variant="contained" disabled={createLoan.isPending} onClick={postLoan}>Create/Submit new Loan</Button>
            </DialogContent>  
          </Dialog>

    
    </React.Fragment>
 }

 export default CreateLoan;