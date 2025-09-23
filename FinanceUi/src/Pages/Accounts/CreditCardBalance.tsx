
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Account, AccountBalance } from "FinanceApi";
import { ACCOUNT_BALANCE, getBalancesByDate } from "../../repositories/accountBalance";
import moment from "moment";
import numeral from "numeral";
import { Grid2 as Grid, LinearProgress, Skeleton, Tooltip, Typography } from "@mui/material";

interface CreditStatementBalanceProps {
  account: Account;
  date: Date;
}

const CreditStatementBalance = (props: CreditStatementBalanceProps) => {
  const viewDate = useMemo(() => {
    var date = props.account.periodStartDay >= moment().date() ? moment(props.date).clone().add(-1,"month") :  moment(props.date)
    return moment(date).format("YYYY-MM-DD");
  }, [props.date]);

  const { data: acctBalance, isLoading } = useQuery<AccountBalance>({
    queryKey: [
      ACCOUNT_BALANCE,
      { accountId: props.account.id, date: moment(viewDate).format("yyyy-MM-01") },
    ],
    queryFn: () => getBalancesByDate(moment(viewDate).format("yyyy-MM-01"), props.account.id),
  });

  const payments = useMemo(()=>{
    if(!acctBalance) return 0
    return acctBalance.transactions.reduce((p,c)=>{
        if(c.amount > 0) return p + Number.parseFloat(c.amount)
        return p
    }, 0.0)
  },[ acctBalance ])


    return <> 
        
        <Grid
            size={3}
            sx={{ alignContent: "center", textAlign: "end" }}
        >
            <Typography variant="body1">
              {isLoading ? <Skeleton variant="text" /> : <Tooltip title={numeral(acctBalance.balance).format("0,0.00")}> 
                          <Typography>{payments > -acctBalance.balance? "0.00" : numeral(acctBalance.balance + payments).format("0,0.00")}</Typography> 
                        </Tooltip>  }
            </Typography>
        </Grid>
        <Grid
            size={3}
            sx={{ alignContent: "center", textAlign: "end" }}
        >
            <Typography variant="body1">
              {numeral(props.account.balance).format("0,0.00")}
            </Typography>
        </Grid>
    </>
};

export default CreditStatementBalance