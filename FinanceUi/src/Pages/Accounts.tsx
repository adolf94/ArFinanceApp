import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  useMediaQuery,
  ListItem,
  ListItemText,
  Grid,
  ListItemButton,
  Stack,
  Box,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_GROUP, fetchGroups } from "../repositories/accountgroups";
import { fetchAccounts, ACCOUNT } from "../repositories/accounts";
import { Account } from "FinanceApi";
import numeral from "numeral";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  fetchByAcctMonth,
  fetchTransactionsByMonth,
  TRANSACTION,
} from "../repositories/transactions";

interface CreditStatementBalanceProps {
  account: Account;
  date: Date;
}

const CreditStatementBalance = (props: CreditStatementBalanceProps) => {
  const [date, setDate] = useState(props.date);

  const { data: transactions } = useQuery({
    queryKey: [
      TRANSACTION,
      {
        accountId: props.account.id,
        year: moment(date).year(),
        month: moment(date).month() + 1,
      },
    ],
    queryFn: () =>
      fetchByAcctMonth(
        props.account.id,
        moment(date).add().year(),
        moment(date).month() + 1,
      ),
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let maxDate =
      moment(props.date).endOf("month").date() > props.account.periodStartDay
        ? props.account.periodStartDay - 1
        : moment(props.date).endOf("month").date() - 1;
    let date = moment(props.date).add(-maxDate, "day");
    setDate(date);
  }, [props.date, props.account]);

  useEffect(() => {
    let internalTotal = [...(transactions || [])].reduce((prev, cur, i) => {
      return prev + (props.account.id === cur.debitId ? -1 : 1) * cur.amount;
    }, props.account.balance);
    setTotal(internalTotal);
  }, [transactions, props.account]);

  return (
    <Grid item xs={3} sx={{ alignContent: "center", textAlign: "end" }}>
      {numeral(total).format("0,0.00")}
    </Grid>
  );
};

const Accounts = (props) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.up("xs"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { data: accountGroups, isLoading : loadingGroups } = useQuery({
    queryKey: [ACCOUNT_GROUP],
    queryFn: fetchGroups,
  });
  const { data: accounts, isLoading:loadingAccts } = useQuery({
    queryKey: [ACCOUNT],
    queryFn: fetchAccounts,
  });

  return (
  <Grid item xs={12}>
        {(loadingGroups || loadingAccts) && <Box sx={{ textAlign: "center" }}>
        <CircularProgress />
        </Box>}
      <List onLoad={() => {}}>
        {(accountGroups || []).map((e) => (
          <React.Fragment key={e.id}>
            <Divider textAlign="left" key={e.id}>
              {e.name}
            </Divider>
            {(accounts || [])
              .filter((a) => e.id === a.accountGroupId && !a.resetEndOfPeriod)
              
              .map((a: Account) => (
                <ListItem key={a.id}>
                  <Grid container sx={{ pt: 1 }}>
                    <Grid item xs={a.periodStartDay===1 ? 9:6}>
                      <Grid
                        key={e.id}
                        onClick={() => navigate("/accounts/" + a.id)}
                      >
                        {a.name}
                      </Grid>
                    </Grid>
                   {a.periodStartDay !== 1 && (
                      <CreditStatementBalance
                        account={a}
                        date={moment().toDate()}
                      />
                    )}
                    <Grid
                      item
                      xs={3}
                      sx={{ alignContent: "center", textAlign: "end" }}
                    >
                      {numeral(a.balance).format("0,0.00")}
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
          </React.Fragment>
        ))}
      </List>
    </Grid>
  );
};

export default Accounts;
