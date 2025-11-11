import { useLiveQuery } from "dexie-react-hooks";
import db from "../../components/LocalDb";
import { and } from "mathjs";
import { where } from "underscore";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { queryClient } from "../../App";
import { ACCOUNT_BALANCE, getAcctBalWithDateRange } from "../../repositories/accountBalance";
import { CardBody } from "reactstrap";
import { Alert, Box, Card, CardContent, Grid2 as Grid, IconButton, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material";
import { AccountBalance } from "FinanceApi";
import { BarChart } from "@mui/x-charts";
import numeral from "numeral";
import useMeasure from 'react-use-measure'
import useDexieDataWithQuery from "../../components/LocalDb/useOfflineData2";
import { Error, Refresh } from "@mui/icons-material";

interface AccountHistoryBarChartProps {
    acctId: string;
    date: string
}

const AccountHistoryBarChart = ({acctId, date} : AccountHistoryBarChartProps) => {
    const fromDate = useMemo(()=>moment(date).add(-5, 'month').format("YYYY-MM-01"),[date])
    const [refetching,setRefetching] = useState(false)
    const [ref, bounds] = useMeasure();

    const {data:acctBalances, isLoading:loading} = useDexieDataWithQuery({
      queryParams: {
        queryKey: [ACCOUNT_BALANCE, {acctId, "start":fromDate,"end":date}],
        queryFn:()=>getAcctBalWithDateRange(acctId,fromDate,date)
      },
      initialData:[],
      dexieData: ()=>db.accountBalances.filter(e=>e.accountId===acctId 
        && e.dateStart <= moment(date).format("YYYY-MM-02")
        && e.dateStart >= fromDate)
        .toArray(),
      
    }, [date,acctId])

        

    const computed = useMemo(()=>{
      let d = (acctBalances || []).sort((a,b)=>a.dateStart < b.dateStart ? 1 : -1).map((bal:AccountBalance)=>{
        let monthStr = moment(bal.dateStart).format("MMM")
        let output =bal.transactions.reduce((p,tr)=>{
          if(tr.amount >= 0){
            p.inflow += tr.amount
          }else{
            p.outflow -= tr.amount
          }
          p.balance += tr.amount
          return p
        }, {
          "outflow":0,
          "inflow":0,
          "balance":0,
          "month":monthStr
        })
        return {
          label : monthStr,
          data : output
        }
      })
      return {
        xAxis: [{data: d.map(e=>e.label)}],
        dataset: d.map(e=>e.data),
        series: [
          {dataKey: "outflow", label: "Outflow", valueFormater:value=>numeral(value).format("0,0.00"), color:"red"},
          {dataKey: "inflow", label: "Inflow", valueFormater:value=>numeral(value).format("0,0.00"), color:'limegreen'}
        ]
      }


    },[acctBalances])

    const balanceValidation = useMemo(()=>{
      if(!acctBalances) return
      let bar = acctBalances.sort((a,b)=>moment(a.dateStart).isAfter(b.dateStart)? 1 : -1)
      let foo = bar.reduce((p,c,i)=>{
        var output = p
        if(i == 0) {
          output.prev = c
          output.data.push({...c,prev: c.balance})
          return output
        }

        c.prev = p.prev.endingBalance
        output.data.push({...c})
        output.prev = c
        
        if(!output.valid) return output
        if(numeral(c.balance).format("0.00") != numeral(c.prev).format("0.00"))
        {
          output.valid = false
        }
        return output
      }, {
        valid : true,
        prev : null,
        data:[]
      })
      return foo

    },[acctBalances])

    const refreshInconsistencies = ()=>{
      setRefetching(true)
      queryClient.fetchQuery({
        queryKey: [ACCOUNT_BALANCE, {acctId, "start":fromDate,"end":date}],
        queryFn:()=>getAcctBalWithDateRange(acctId,fromDate,date),
        staleTime: 0
      }).then(()=>{
        setRefetching(false)
      });
    }

    return <Grid size={12} sx={{px:3}}>
      {balanceValidation.valid ? "" : 
      <>
      <Alert icon={<Error />} color="error" sx={{mb:2}} onClick={refreshInconsistencies} >
        {refetching? "Refetching Data" :"Data Inconsistencies found"}
      </Alert>
      
      <Card>
        <CardBody>
          <Grid container sx={{width:"100%"}}>
            <Grid size={12}></Grid>
            <TableContainer >
              <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>PrevEnding</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>EndingBalance</TableCell>
                </TableRow>
                {balanceValidation.data.map(e=><TableRow>
                  <TableCell>{e.month}</TableCell>
                  <TableCell>{e.prev}</TableCell>
                  <TableCell>{e.balance}</TableCell>
                  <TableCell>{e.endingBalance}</TableCell>
                </TableRow>
                )}
                {
                  
                }
              </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </CardBody>
      </Card>
      </> 
       }  
      <Card>
          <CardBody>
						<Box sx={{width:"100%", display:"block"}} ref={ref}>
              {(acctBalances|| []).length > 0 &&
              <BarChart
                yAxis={[{
                  valueFormatter:value=>numeral(value).format("0 a")
                }]}
                xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                series={computed.series}
                dataset={computed.dataset}
                width={bounds.width}
                height={250}
              />}
            </Box>
            

          </CardBody>
      </Card>
    </Grid>

};

export default AccountHistoryBarChart;