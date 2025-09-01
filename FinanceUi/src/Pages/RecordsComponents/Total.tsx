import { faL } from "@fortawesome/free-solid-svg-icons"
import { Box, Collapse, Grid2 as Grid, LinearProgress, List, ListItem, ListItemButton, ListItemText, Paper, Skeleton, Tab, Tabs, Typography } from "@mui/material"
import { useContext, useMemo, useState } from "react"
import db from "../../components/LocalDb"
import moment from "moment"
import { useLiveQuery } from "dexie-react-hooks"
import useDexieDataWithQuery from "../../components/LocalDb/useOfflineData2"
import { ACCOUNT_BALANCE, getBalancesByDate } from "../../repositories/accountBalance"
import { RecordsContext } from "../Records"
import { Transaction } from "../../components/LocalDb/AppDb"
import { useQuery } from "@tanstack/react-query"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups"
import { groupBy } from "lodash"
import numeral from "numeral"





const ExpenseGroupListItem = ({item,total})=>{
  const [show,setShow] = useState(false)


  return <><ListItemButton onClick={()=>setShow(!show)} sx={{display:'block' }}>
  <Grid container>
    <Grid size={6}>
      <Typography variant="body1">{item.name}</Typography>
    </Grid>
    <Grid size={3} sx={{textAlign:"right"}}>
      <Typography variant="body1" sx={{fontWeight:"bold"}}>{numeral(item.amount).format("0,0.00")}</Typography>
    </Grid>
    <Grid size={3} sx={{px:1}}>
      <LinearProgress variant="determinate" value={(item.amount * 100/total)}/>
    </Grid>
  </Grid>
  </ListItemButton>
  <Collapse in={show} timeout="auto" mountOnEnter>
    <List component="div" sx={{ width:'100%', pr:1}} disablePadding>
      {
        item.accounts.sort((a,b)=>b.amount-a.amount).map(acc=><ListItem sx={{ display:'block' }}>
          <Grid container sx={{pl: 4}}>
            <Grid size={6}>
              <Typography variant="body1">{acc.name}</Typography>
            </Grid>
            <Grid size={3} sx={{textAlign:"right",pr:1}}>
              <Typography variant="body1">{numeral(acc.amount).format("0,0.00")}</Typography>
            </Grid>
            <Grid size={3} sx={{px:1}}>
              <LinearProgress variant="determinate" value={(acc.amount * 100/item.amount)}/>
            </Grid>
          </Grid>
        </ListItem>
        )
      }
      
    </List>
  </Collapse>
  </>
}

interface TotalTabProps {
  date: string;
  records: Transaction[]
}

const TotalTab = ({date,records} : TotalTabProps) => {
  const [type,setType] = useState("a68ebd61-ce5d-4c99-10ca-08dabb20ff77")
  // const [type,setType] = useState("04c78118-1131-443f-2fa6-08dac49f6ad4")
  const [total,setTotal] = useState(1)


  const {data:balances, isLoading} = useDexieDataWithQuery({
    dexieData : ()=>db.accountBalances.where("dateStart")
      .equals(moment(date).format("YYYY-MM-DDTHH:mm:ss")).toArray(),
    queryParams : {
      queryKey: [
            ACCOUNT_BALANCE,
            {date},
          ],
      queryFn: ()=>getBalancesByDate(date)
      
    },
    dataToDbFunction : (data)=>{
      return db.accountBalances.bulkPut(data)
    }
  },[date,type])


  const {data:acctGroups, isLoading : groupLoading} = useQuery({
    queryKey: [ACCOUNT_GROUP],
    queryFn: ()=>fetchGroups()
  })




  const computed = useMemo(()=>{
    if (!records || !acctGroups) return []
    let accounts = new Map();
    let total = 0
    records.forEach(rec=>{
      if(rec.debit.type == type){
        total += rec.amount
        if(!accounts.has(rec.debit.id)){
          let data = {
            id: rec.debit.id,
            name: rec.debit.name,
            amount: rec.amount,
            groupId:rec.debit.accountGroupId
          }
          accounts.set(rec.debit.id,data)
        }else{
          let data = accounts.get(rec.debit.id)
          data.amount += rec.amount
          accounts.set(rec.debit.id,data)
        }
      }

      if(rec.credit.type == type){
        total += rec.amount
        if(!accounts.has(rec.credit.id)){
          let data = {
            id: rec.credit.id,
            name: rec.credit.name,
            amount: rec.amount,
            groupId:rec.credit.accountGroupId,
          }
          accounts.set(rec.credit.id,data)
        }else{
          let data = accounts.get(rec.credit.id)
          data.amount += rec.amount
          accounts.set(rec.credit.id,data)
        }
      }
    })
    let accountValues = Array.from(accounts.values())

    let grouped = groupBy(accountValues,e=>e.groupId)
    setTotal(total || 1)
    return Object.keys(grouped).map(key=>{
        var group = acctGroups.find(g=>g.id == key)
        return {...group, accounts: grouped[key],
          amount: grouped[key].reduce((a,b)=>a+b.amount,0)
          
        }
    })
  },[records,type])




    return  <>
    <Box sx={{ my: 1, maxHeight: "80vh", overflow: "overlay" }}>
      <Paper sx={{ p: 1 }}>
            <Tabs
              value={type || "a68ebd61-ce5d-4c99-10ca-08dabb20ff77"}
              onChange={(_,v)=>setType(v)}
              aria-label="basic tabs example"
            >
              <Tab label="Expense" value="a68ebd61-ce5d-4c99-10ca-08dabb20ff77" />
              <Tab label="Income" value="04c78118-1131-443f-2fa6-08dac49f6ad4" />
            </Tabs>
      </Paper>
      <Paper sx={{ p: 1, my: 1 }}>

      </Paper>
      <Paper sx={{ p: 1, my: 1 }}>
        {/* {isLoading? <LoadingList />: */}
          <List>
            {computed.sort((a,b)=>b.amount-a.amount).map(grp=><ExpenseGroupListItem item={grp} total={total}/>)}
          </List>
        {/* } */}
      </Paper>
    </Box>
    </>
}

const LoadingList = ()=>{
  
  return <List>
  <ListItem>
    <Skeleton variant="text" sx={{width:"100%"}}/>
  </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
  <ListItem>
    <Skeleton variant="text" sx={{width:"100%"}}/>
  </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
  <ListItem>
    <Skeleton variant="text" sx={{width:"100%"}}/>
  </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
  <ListItem>
    <Skeleton variant="text" sx={{width:"100%"}}/>
  </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
  <ListItem>
    <Skeleton variant="text" sx={{width:"100%"}}/>
  </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
    <ListItem sx={{ pl: 4 }}>
      <Skeleton variant="text" sx={{width:"100%"}}/>
    </ListItem>
</List>
}

export default TotalTab;