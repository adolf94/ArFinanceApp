import { Box, Card, Chip, Dialog, Drawer, Grid2, Stack, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import useDexieDataWithQuery from "../LocalDb/useOfflineData2"
import { fetchTransactionsByMonth, fetchTransactionsByMonthKey, TRANSACTION } from "../../repositories/transactions"
import moment from "moment"
import { Transaction } from "FinanceApi"
import db from "../LocalDb"
import numeral from "numeral"


interface SelectorDrawerPropsBase<T> {
  open : boolean,
  type : "asset" | "transaction"| "expense"| "income",
  onChange: (data: T)=>any,
  onClose: ()=>any,
  value?:T,
  useValue?: boolean
}

interface TransactionSelectorProps<T> {
  filters : {
    date : string | moment.Moment,

  },
  onChange: (data : T)=>any
}


const TransactionSelector = ({filters, onChange}: TransactionSelectorProps)=>{
    const month = moment(filters?.date)
    const monthKey = moment(filters?.date).format("YYYY-MM-01")
    const {data:transactions} = useDexieDataWithQuery({
      queryParams:{queryKey:[TRANSACTION,{monthKey}], queryFn:()=>fetchTransactionsByMonth(month.get("year") , month.get("month") + 1, "true")},
      dexieData: ()=>db.transactions.where("monthKey").equals(monthKey).toArray(),
      initialData: [],
      dataToDbFunction:(data)=>db.transactions.bulkPut(data)
    },[filters.date])


    const filtered = useMemo(()=>{
      const creditIds = filters.account.map(e=>e.id)
      const vendorIds = filters.vendor.map(e=>e.id)
      let f = transactions.filter(t=>{
        return (creditIds.length == 0 || creditIds.indexOf(t.creditId) > -1) && (vendorIds.length == 0 || vendorIds.indexOf(t.vendorId) > -1) 
      })
      return f.sort((a,b)=>a.date < b.date ? 1: -1)
    },[transactions, filters])

    return <>

        <Stack>
          <Box sx={{px:3,mb:2}}>
            <Typography variant="formlabel" sx={{p:1}}>TEXT</Typography>  
            <TextField value="" fullWidth placeholder="Search" sx={{"& fieldset":{borderRadius:4}}}/>
            <Box sx={{pt:2}}>
            {filters.account.map(e=><Chip label={e.name} size="small"/>)}
            {filters.vendor.map(e=><Chip label={e.name} size="small"/>)}
            </Box>
          </Box>
          <Box sx={{ height:"auto",backgroundColor:"#f0ededff", pt:2,px:1}}>
            {filtered.map(t=><Card sx={{p:2,mt:1,cursor:"pointer"}} onClick={()=>onChange(t)}>
              <Grid2 container columns={5}>
                <Grid2 size={4}>
                  <Typography variant="formlabel">{t.vendor?.name}</Typography>
                  <Typography variant="body2">{t.description}</Typography>
                  <Typography variant="formlabel" sx={{color:"#9d9d9d"}}>{moment(t.date).format("YYYY-MM-DD")}</Typography>
                  <Chip label={t.credit?.name} size="small" sx={{mx:"1px"}}/>
                  <Chip label={t.debit?.name} size="small" sx={{mx:"1px"}}/>
                </Grid2>
                <Grid2 size={1} sx={{textAlign:"right"}}>
                  <Typography variant="subtitle2" sx={{fontSize:"1rem"}}>{numeral(t.amount).format("0,0.00")}</Typography>
                </Grid2>
              </Grid2>
            </Card>)}
            
          </Box>
        </Stack>
    </>

}



interface SelectorDrawerProps<T> extends  TransactionSelectorProps<T> , SelectorDrawerPropsBase<T> {

}

const SelectorDrawer = <T,>({open,type, onChange, useValue, value, onClose, filters} : SelectorDrawerProps<T>)=>{


    return <Drawer open={open} onClose={onClose} anchor="right" >
      <Box sx={{minWidth:{md:"30vw"}}}>
        <TransactionSelector filters={filters} onChange={onChange}/>
      </Box>
    </Drawer>

}

export default SelectorDrawer