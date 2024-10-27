import { Box, Card, Chip, FormControl, Grid2 as Grid, IconButton, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material"
import { CheckCircle, GroupAdd, ManageAccounts  } from "@mui/icons-material"
import { useQuery } from "@tanstack/react-query"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import { getAll, USER } from "../../../repositories/users"
import CreateMemberProfile from "./CreateMemberProfile"
import { getMemberProfiles, MEMBER_PROFILE } from "../../../repositories/memberProfile"
import { COOP_OPTION, getOptionByYear } from "../../../repositories/coopOption"
import cron from 'cron-parser'


interface UserPanelProps {

}
const years = (()=>{
  let initial = 2023
  let items = []
  while(initial <= moment().add(1,'year').year()){
    items.push(initial)
    initial++
  }
  return items
})()

const UserPanel = (props: UserPanelProps) => {

  const [year, setYear] = useState(moment().year())
  const { data: clients, isLoading } = useQuery({ queryKey: [USER], queryFn: () => getAll() })
  
  const {data: option} = useQuery({
    queryKey: [COOP_OPTION,{year}],
     queryFn:()=>getOptionByYear(year),
     retry:false,
     staleTime: 600000,
     gcTime: 24*60*60*1000
  })
  const { data: members, isLoading:loadingMembers } = useQuery({ queryKey: [MEMBER_PROFILE], queryFn: () => getMemberProfiles(year), enabled:!!option })
  const [selectedUser, setSelected ] = useState(null)
  const [iterations, setIterations] = useState<any[]>([])

  useEffect(()=>{
    if(!option) return

    let items = [];
    let expression = moment(option.firstInstallment).format(option?.frequency?.cron);
    let interval = cron.parseExpression(expression, {
      currentDate: moment(option.firstInstallment).toDate()
    });
    let i = 1;
    items.push({
      index:1,
      date: moment(option.firstInstallment),
      dateStr: moment(option.firstInstallment).format("YYYY-MM-DD"),
      label: moment(option.firstInstallment).format("MMM-DD")
    })
    while (i < option.installmentCount) {
      let x = interval.next();
      i++
      items.push({
        index:1,
        date: moment(x.toDate()),
        dateStr: moment(x.toDate()).format("YYYY-MM-DD"),
        label: moment(x.toDate()).format("MMM DD")
      })
    }
    console.log(items)
    setIterations( items);

  },[option])

  const membersWithName = useMemo(()=>{
    if(!members) return []
    return members.map(member=>{
      let user = clients.find(c=>c.id == member.userId)
      return {
        ...member,
        user
      }
    })
  },[members])


  return <Box sx={{ width: '100%' }}>
    <Grid container>
      <Grid container size={12} sx={{justifyContent:'end', p:1, px:2}}>
        <Box>
          <FormControl >
            <InputLabel id="demo-simple-select-label">Year</InputLabel>
            <Select
              value={year}
              label="Year"
              size="small"
              onChange={(evt)=>setYear(Number.parseInt(evt.target.value.toString()))}
            >
              {years.map(e=><MenuItem value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Grid>
      <Grid size={{ sm: 12 }} sx={{p:2}}>
        <Card variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={4}>Members</TableCell>                  
                </TableRow>
              </TableHead>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  {iterations.map(e=><TableCell><div>{e.label}</div></TableCell>)}
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members && membersWithName.map((member : any)=><TableRow>
                  <TableCell>{member.user.name}</TableCell>
                  {iterations.map(e=><TableCell sx={{p:1}} >
                    <Chip label="1.5k" size="small"/>
                  </TableCell>)}
                  <TableCell>Action</TableCell>

                </TableRow>)}
                
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
      <Grid size={{ sm: 12 }} sx={{p:2}}>
        <Card variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={4}>All Users</TableCell>                  
                </TableRow>
              </TableHead>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile Number</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!isLoading && clients.map((client : any)=><TableRow>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.mobileNumber}</TableCell>
                  <TableCell>{
                      client.roles.map((e:string)=><Chip label={e} size="small" color="info"/>)
                    }</TableCell>
                  <TableCell>
                    <Tooltip title="Add as a coop member">
                      <IconButton onClick={()=>setSelected(client)}><GroupAdd /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit information">
                      <IconButton><ManageAccounts /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>)}
                
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
    {selectedUser && <CreateMemberProfile user={selectedUser} year={year} onClose={()=>setSelected(null)}/>}
  </Box>
}


export default UserPanel