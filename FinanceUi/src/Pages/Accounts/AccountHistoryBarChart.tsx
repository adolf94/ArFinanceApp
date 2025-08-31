import { useLiveQuery } from "dexie-react-hooks";
import db from "../../components/LocalDb";
import { and } from "mathjs";
import { where } from "underscore";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { queryClient } from "../../App";
import { ACCOUNT_BALANCE, getAcctBalWithDateRange } from "../../repositories/accountBalance";
import { CardBody } from "reactstrap";
import { Box, Card, Grid2 as Grid } from "@mui/material";
import { AccountBalance } from "FinanceApi";
import { BarChart } from "@mui/x-charts";
import numeral from "numeral";
import useMeasure from 'react-use-measure'

interface AccountHistoryBarChartProps {
    acctId: string;
    date: string
}

const AccountHistoryBarChart = ({acctId, date} : AccountHistoryBarChartProps) => {
    const fromDate = useMemo(()=>moment(date).add(-5, 'month').format("YYYY-MM-01"),[date])
    const [loading,setLoading] = useState(true)
    const [ref, bounds] = useMeasure();


    const acctBalances = useLiveQuery(()=>db.accountBalances.filter(e=>e.accountId===acctId 
        && e.dateStart <= moment(date).format("YYYY-MM-02")
        && e.dateStart >= fromDate)
        .toArray(),[loading,date,acctId])

    useEffect(()=>{
        let data = queryClient.ensureQueryData({
            queryKey: [ACCOUNT_BALANCE, {acctId, "start":fromDate,"end":date}],
            queryFn:()=>getAcctBalWithDateRange(acctId,fromDate,date)
        }).then((data)=>{
            console.log(data)
            setLoading(false)
        })
    },[date,date,acctId])
        

    const computed = useMemo(()=>{
      let d = (acctBalances || []).map((bal:AccountBalance)=>{
        let monthStr = moment(bal.dateStart).format("MMM YYYY")
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

 

    return <Grid size={12} sx={{p:3}}>
      <Card>
          <CardBody>
						<Box sx={{width:"100%", display:"block"}} ref={ref}>
              {(acctBalances|| []).length > 0 &&
              <BarChart
                xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                series={computed.series}
                dataset={computed.dataset}
                width={bounds.width}
                height={300}
              />}
            </Box>
            

            {/* <BarChart
              dataset={dataset}
              xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
              series={[
                { dataKey: 'london', label: 'London', valueFormatter },
                { dataKey: 'paris', label: 'Paris', valueFormatter },
                { dataKey: 'newYork', label: 'New York', valueFormatter },
                { dataKey: 'seoul', label: 'Seoul', valueFormatter },
              ]}
              {...chartSetting}
            /> */}
          </CardBody>
      </Card>
    </Grid>

};

export default AccountHistoryBarChart;