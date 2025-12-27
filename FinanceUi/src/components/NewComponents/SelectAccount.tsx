import { Dialog, DialogContent, DialogContentText, Grid2 as Grid, List, ListItem, ListItemButton } from "@mui/material"
import { useMemo, useState } from "react"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts";
import useDexieDataWithQuery from "../LocalDb/useOfflineData2";
import db from "../LocalDb";
import { Account } from "../LocalDb/AppDb";



const SelectAccount = ({value, onChange, show, type})=>{
    // const [show,setShow] = useState(true)
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


    const typeId =  type === "account"? "892f20e5-b8dc-42b6-10c9-08dabb20ff77" :
            type === "expense"
                ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77"
                : "04c78118-1131-443f-2fa6-08dac49f6ad4"

    const groups = useMemo(()=>stgAcctGroups.filter(e=>e.accountTypeId == typeId)
        .sort((a,b)=>{
           return a.name > b.name ? 1:-1
        }),[stgAcctGroups])


        
    const accts = useMemo(()=>{
        return stgAccts.filter(e=>e.accountGroup.accountTypeId == type).sort((a,b)=>{
            if(a.accountGroupId == b.accountGroupId){
                return a.name > b.name ? 1:-1
            }
            return a.accountGroup.name > b.accountGroup.name ? 1:-1

        })
    },[stgAccts,type])

    return <>
    
      <Dialog open={show} maxWidth="md" fullWidth>
        <DialogContentText>
          
          <Grid container columns={10}>
            <Grid size={4}>
              <List>
                {groups.map(lt=><ListItem key={lt.id} dense>
                  <ListItemButton>
                    {lt.name}
                  </ListItemButton>
                </ListItem>)}
                
              </List>
            </Grid>
            <Grid size={6}></Grid>
          </Grid>
        </DialogContentText>
      </Dialog>
    </>
}

export default SelectAccount