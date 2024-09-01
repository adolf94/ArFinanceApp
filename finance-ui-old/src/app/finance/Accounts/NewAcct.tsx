import { Add, ArrowBack as IcoArrowBack} from "@mui/icons-material"
import { AppBar, Button, Grid, IconButton, Stack, TextField, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material"
import useHeaderContext from "../common/headerContext"
import { useLayoutEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import ResponsiveSelect from "../common/ResponsiveSelect"
import { Account, AccountGroup } from "FinanceProject"
import { v4 } from "uuid"
import { useQuery } from "react-query"
import { getAll, getByType } from "../../../repositories/accountGroup"
import { useMutateAccount } from "../../../repositories/account"


const NewAcct = (props: any) => {

  const ref = useRef<HTMLDivElement>(null)
  const ctx = useHeaderContext()
  const navigate = useNavigate()
  const { typeid } = useParams()
  
  const { create } = useMutateAccount();
  const [val,setVal] = useState(null)
  const [form, setForm] = useState({
    id:v4(),
    name: "",
    accountGroup: null,
    enabled: true,
    balance: 0,
    currBalance: 0,
    foreignExchange: 1

  })

  const { data: groups } = useQuery({
      queryKey: ["groups", { accountTypeId: typeid }],
      queryFn: () => getByType(typeid)
    })

  useLayoutEffect(() => {
    if (ref.current) {
      if (ref.current.offsetHeight != ctx.height)
        ctx.set({ ...ctx, height: ref.current.offsetHeight });
    }
  })


  const saveAccount = () => {
    if (!form.accountGroup) return
    if(!form.name) return
    create.mutateAsync({...form, accountGroupId: form.accountGroup.id, accountGroup: undefined})
      .then(e=>navigate(-1))

  }


  const trail = (data : string) => {
    return (Math.round( Number.parseFloat(data) * 100) / 100).toFixed(2)
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
          <Typography>Account Group</Typography>
        </Grid>
        <Grid item xs={8} sx={{ pr: 1 }}>
          <Grid container sx={{ display: 'flex' }}>
            <Grid item sx={{ flexGrow: 1 }}>
              <ResponsiveSelect options={groups || []} fullWidth onChange={(val) => setForm({ ...form, accountGroup :val})} variant="standard" getOptionLabel={opt => opt.name}
                getOptionValue={opt => opt.id} value={form.accountGroup} />
            </Grid>
            <Grid item sx={{ flexShrink: 1, ml:1,mt:1 }}>
              <Button variant="contained" size="small" onClick={()=>navigate(`../newGroup/${typeid}`)}>
                <Add />
              </Button>
            </Grid>
          </Grid>
          {/*<ResponsiveSelect options={options} fullWidth onChange={changeHandler} variant="standard" getOptionLabel={opt => opt.label} getOptionValue={opt => opt.value} value={val} />*/}
        </Grid>
      </Grid>
      <Grid container sx={{ alignItems: 'center' ,mt:2}}>
        <Grid item xs={4}>
          <Typography>Account Name</Typography>
        </Grid>
        <Grid item xs={8}>
          <TextField value={form.name} size="small" variant="standard" onChange={(evt) => { setForm({ ...form, name: evt.target.value }) }} fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ alignItems: 'center', mt: 2 }}>
        <Grid item xs={4}>
          <Typography>Current Amount</Typography>
        </Grid>
        <Grid item xs={8} sx={{ textAlign: 'right' }}>
          <TextField value={form.balance} size="small"
            inputProps={{ min: 0, style: { textAlign: 'right' } }}
            variant="standard" type="number" onChange={(evt) => setForm({ ...form, currBalance: evt.target.value, balance:evt.target.value })} onBlur={(evt) => { setForm({ ...form, currBalance: trail(evt.target.value), balance: trail(evt.target.value) }) }} fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{ alignItems: 'center', mt: 2 }}>
        <Grid item xs={4}>
          <Typography>Description</Typography>
        </Grid>
        <Grid item xs={8} sx={{ textAlign: 'right' }}>
          <TextField value={form.balance} size="small"
            variant="standard" onChange={(evt) => { }}  fullWidth />
        </Grid>
      </Grid>
      <Grid container sx={{pt:3} }>
        <Button variant="contained" fullWidth onClick={saveAccount}> Save </Button>
      </Grid>
    </Stack>
  </>
}

export default NewAcct