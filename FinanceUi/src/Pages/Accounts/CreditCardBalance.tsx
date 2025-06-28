
import { useMemo, useState } from "react";
import {
  fetchByAcctMonth,
  fetchTransactionsByMonth,
  TRANSACTION,
} from "../repositories/transactions";
import { useQuery } from "@tanstack/react-query";
import { Account, AccountBalance } from "FinanceApi";
import { ACCOUNT_BALANCE, getBalancesByDate } from "../../repositories/accountBalance";
import moment from "moment";
import { AccountBalance } from "@mui/icons-material";
import numeral from "numeral";
import { Grid, LinearProgress, Skeleton } from "@mui/material";

interface CreditStatementBalanceProps {
  account: Account;
  date: Date;
}

const CreditStatementBalance = (props: CreditStatementBalanceProps) => {
    
  const { data: acctBalance, isLoading } = useQuery<AccountBalance>({
    queryKey: [
      ACCOUNT_BALANCE,
      { accountId: props.account.id, date: moment(props.date).format("yyyy-MM-01") },
    ],
    queryFn: () => getBalancesByDate(moment(props.date).format("yyyy-MM-01"), props.account.id),
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
            item
            xs={3}
            sx={{ alignContent: "center", textAlign: "end" }}
        >
            {isLoading ? <Skeleton variant="text" /> : numeral(acctBalance.balance + payments).format("0,0.00")  }
        </Grid>
        <Grid
            item
            xs={3}
            sx={{ alignContent: "center", textAlign: "end" }}
        >
            {numeral(props.account.balance).format("0,0.00")}
        </Grid>
    </>
};

export default CreditStatementBalance