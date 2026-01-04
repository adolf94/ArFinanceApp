import { Dialog, DialogContent, DialogContentText, Grid2 as Grid, List, ListItem, ListItemButton, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts";
import useDexieDataWithQuery from "../LocalDb/useOfflineData2";
import db from "../LocalDb";
import { Account } from "../LocalDb/AppDb";
import { fetchVendors, VENDOR } from "../../repositories/vendors";
import { Vendor } from "FinanceApi";



const SelectAccount = ({value, onChange, show, type, onClose})=>{
    // const [show,setShow] = useState(true)
    const [selectedGroup,setSelectedGroup] = useState(null)
    const [acct,setAcct] = useState(null)
    const [query,setQuery] = useState("")
    const { data: stgAcctGroups, isLoading: groupLoading } = useQuery({
      queryKey: [ACCOUNT_GROUP],
        placeholderData:[],
        queryFn: fetchGroups,
    });

     const {data:stgAccts, isLoading} = useDexieDataWithQuery<Account[]>({
        queryParams: {queryKey:[ACCOUNT], queryFn: ()=>fetchAccounts()},
        dexieData: ()=>db.accounts.toArray(),
        dataToDbFunction: ()=>{},
        initialData:[]
    },[])
    
    const { data: vendors, isLoading: vendorLoading } = useQuery<Vendor[]>({
      queryKey: [VENDOR],
        placeholderData:[],
        queryFn: fetchVendors,
    });


    const typeId = type === "vendor" ? "": 
            type === "account"? "892f20e5-b8dc-42b6-10c9-08dabb20ff77" :
            type === "expense"
                ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77"
                : "04c78118-1131-443f-2fa6-08dac49f6ad4"

    const groups = useMemo(()=>stgAcctGroups.filter(e=>e.accountTypeId == typeId)
        .sort((a,b)=>{
           return a.name > b.name ? 1:-1
        }),[stgAcctGroups])

        
    const accts = useMemo(()=>{
        return stgAccts.filter(e=>e.accountGroupId == selectedGroup?.id).sort((a,b)=>{
            return a.accountGroup.name > b.accountGroup.name ? 1:-1
        })
    },[stgAccts,selectedGroup])



    const setValue = (value)=>{
        setAcct(value);
        let shouldClose = (value !== null && acct !==null && acct?.id === value?.id ) 
        onChange({ ...value }, shouldClose);
    }

    const filteredVendors = useMemo(()=>{
        if(type != "vendor") return []
        let sorted = vendors.sort((a,b)=>a.name > b.name ? 1 : -1)
        if(query == "") return sorted
        return vendors.filter(e=>e.name.toLowerCase().indexOf(query) > -1)
    },[vendors,type, query])



    return <>
    
      <Dialog open={show} maxWidth="md" fullWidth onClose={()=>onClose()}>
        <DialogContentText>
          <Grid sx={{p:2}}>
            <Typography variant="formlabel">Search</Typography>
            <TextField value={query} variant="outlined" fullWidth onChange={(evt)=>setQuery(evt.target.value)}></TextField>
          </Grid>
          <Grid container columns={10}>
            {
              type == "vendor" ? 
                <Grid size={12} sx={{maxHeight:"75vh",overflow:"auto"}}>
                    {filteredVendors.map(lt=><ListItem key={lt.id} dense>
                      <ListItemButton onClick={()=>setValue(lt)}>
                        <Typography variant="body1">{lt.name}</Typography>
                      </ListItemButton>
                    </ListItem>)}
                </Grid>
                : <>
                  <Grid size={4} sx={{backgroundColor:"#fffef3ff"}}  sx={{maxHeight:"75vh",overflow:"auto"}}>
                    <List>
                      {groups.map(lt=><ListItem key={lt.id} dense>
                        <ListItemButton onClick={()=>setSelectedGroup(lt)}>
                          <Typography variant="body2">{lt.name}</Typography>
                        </ListItemButton>
                      </ListItem>)}
                      
                    </List>
                  </Grid>
                  <Grid size={6}  sx={{maxHeight:"75vh",overflow:"auto"}}>
                      {accts.map(lt=><ListItem key={lt.id} dense>
                        <ListItemButton onClick={()=>setValue(lt)}>
                          <Typography variant="body2">{lt.name}</Typography>
                        </ListItemButton>
                      </ListItem>)}
                  </Grid>
                </>
            }
          </Grid>
        </DialogContentText>
      </Dialog>
    </>
}

export default SelectAccount