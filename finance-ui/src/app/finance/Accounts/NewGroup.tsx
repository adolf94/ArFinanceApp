import { ArrowBack as IcoArrowBack} from "@mui/icons-material"
import { AppBar, Button, FormControl, FormControlLabel, FormLabel, Grid, IconButton, Radio, RadioGroup, Stack, TextField, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material"
import useHeaderContext from "../common/headerContext"
import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ResponsiveSelect from "../common/ResponsiveSelect"
import { useQuery } from "react-query"
import { getById } from "../../../repositories/accounttypes"
import { AccountGroup, AccountType } from "FinanceProject"
import { v4 as uuidv4} from 'uuid'
import { useMutateAccountGroup } from "../../../repositories/accountGroup"


interface AccountGroupState extends AccountGroup{
  AccountType : null | AccountType
}


const NewGroup = (props: any) => {

  const ref = useRef<HTMLDivElement>(null)
  const ctx = useHeaderContext()
  const navigate = useNavigate()
  const { typeid } = useParams()
  const { data: type } = useQuery({
      queryKey: ["accountType", { accountTypeId: typeid }],
      queryFn: () => getById(typeid!),
      onError: (err)=>console.log(err)
  })
  const mutateAccountGroup = useMutateAccountGroup()
  const [form, setForm] = useState<Partial<AccountGroup>>({
      id: uuidv4(),
      name: "",
      accountTypeId: typeid,
      isCredit: false,
      enabled:true,
      
    })
  useLayoutEffect(() => {
    if (ref.current) {
      if (ref.current.offsetHeight != ctx.height)
        ctx.set({ ...ctx, height: ref.current.offsetHeight });
    }
  })

  
  const createNew = () => {
    if(!form.name) return
    mutateAccountGroup.create(form)
      .then(data => {
        navigate(-1)
      })
  }


  return <> <AppBar ref={ref} position="fixed">
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item>
        <Toolbar variant="dense"  >
          <IconButton>
            <IcoArrowBack onClick={()=>navigate("../")} />
          </IconButton>
          <Typography>New Account</Typography>
        </Toolbar>
      </Grid>
      <Grid item>

      </Grid>
    </Grid>
  </AppBar>
    <Stack>
      <Grid container sx={{ mt: ctx.height + 'px', alignItems: 'center' }}>
        <Grid item xs={4}>
          <Typography>Group Name</Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField value={form.name} size="small" variant="standard" onChange={(evt) => { setForm({ ...form, name: evt.target.value! }) }} fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ alignItems: 'center', mt: 2 }}>
        <Grid item xs={12}>
          <FormControl>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={form.isCredit ? "credit" : "default"}
              onChange={(evt) => setForm({ ...form, isCredit:evt.target.value=="credit"})}
          >
              <FormControlLabel value="default" control={<Radio checked={!form.isCredit} />} label="Default" />
              <FormControlLabel value="credit" control={<Radio checked={form.isCredit} />} label="Credit Card" />
          </RadioGroup>
        </FormControl>
        </Grid>
      </Grid>
      <Grid container sx={{pt:3} } >
        <Button variant="contained" fullWidth onClick={createNew}> Save </Button>
      </Grid>
    </Stack>
  </>
}

export default NewGroup