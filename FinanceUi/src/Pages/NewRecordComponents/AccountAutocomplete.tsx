import { Autocomplete, TextField } from "@mui/material"
import useDexieDataWithQuery from "../../components/LocalDb/useOfflineData2"
import { ACCOUNT, fetchAccounts } from "../../repositories/accounts"
import db from "../../components/LocalDb"
import { Account } from "FinanceApi"
import { useMemo } from "react"
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups"




const AccountAutocomplete = (props)=>{
    const {data:stgAccts, isLoading} = useDexieDataWithQuery<Account[]>({
        queryParams: {queryKey:[ACCOUNT], queryFn: ()=>fetchAccounts()},
        dexieData: ()=>db.accounts.toArray(),
        dataToDbFunction: ()=>{},
        initialData:[]
    },[])


    const type =  props.type === "transfer"? "892f20e5-b8dc-42b6-10c9-08dabb20ff77" :
            props.type === "expense"
                ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77"
                : "04c78118-1131-443f-2fa6-08dac49f6ad4"

    const accts = useMemo(()=>{
        return stgAccts.filter(e=>e.accountGroup.accountTypeId == type).sort((a,b)=>{
            if(a.accountGroupId == b.accountGroupId){
                return a.name > b.name ? 1:-1
            }
            return a.accountGroup.name > b.accountGroup.name ? 1:-1

        })
    },[stgAccts,props.type])

    return <Autocomplete 
        {...props}
        value={props.value}
        onChange={(_,e)=>props.onChange(e)}
        options={accts}
        renderOption={(props,opt:Account)=><li {...props}> {opt.accountGroup?.name} {">"} {opt.name}</li>}
        getOptionLabel={(opt : Account)=> `${opt.name} (${opt.accountGroup.name})`}
        getOptionKey={(opt : Account)=> `${opt.id}`}
        renderInput={(p)=><TextField {...p} />}
    />

}

export default AccountAutocomplete