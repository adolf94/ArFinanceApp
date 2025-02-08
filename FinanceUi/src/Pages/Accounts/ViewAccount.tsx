import {
    Add,
  ArrowLeft,
  ArrowLeftOutlined,
  ChevronLeft as IcoChevronLeft,
  ChevronRight as IcoChevronRight,
} from "@mui/icons-material";
import {
  AppBar,
  Chip,
  colors,
  Divider,
  Fab,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React, { useMemo, useState } from "react";
import {
  TRANSACTION,
  fetchTransactionsByMonth,
  fetchByAcctMonth,
} from "../../repositories/transactions";
import { useNavigate, useParams } from "react-router";
import { Link } from 'react-router-dom'
import { AccountBalance, Transaction } from "FinanceApi";
import { ACCOUNT, fetchByAccountId } from "../../repositories/accounts";
import {
  ACCOUNT_BALANCE,
  getBalancesByDate,
} from "../../repositories/accountBalance";
import numeral from "numeral";


const fabGreenStyle = {
    position: "absolute",
    bottom: 72,
    right: 16,
    color: "common.white",
    bgcolor: colors.green[500],
    "&:hover": {
        bgcolor: colors.green[600],
    },
};

interface RecordViewTransaction {
  dateGroup: string;
  day: number;
  dayOfWeek: string;
  items: TransactionWithRunningBal[];
  expenses: number;
  income: number;
}

interface TransactionWithRunningBal extends Transaction {
  runningBalance: number;
}

const ViewAccount = () => {
  const { acctId } = useParams();
  const [month, setMonth] = useState(moment());
  const { data: records } = useQuery({
    queryKey: [
      TRANSACTION,
      { accountId: acctId, month: month.month() + 1, year: month.year() },
    ],
    queryFn: () => fetchByAcctMonth(acctId, month.year(), month.month() + 1),
  });
  const { data: account } = useQuery({
    queryKey: [ACCOUNT, { id: acctId }],
    queryFn: () => fetchByAccountId(acctId),
  });
  const { data: acctBalance, isLoading } = useQuery<AccountBalance>({
    queryKey: [
      ACCOUNT_BALANCE,
      { accountId: acctId, date: month.format("yyyy-MM-01") },
    ],
    queryFn: () => getBalancesByDate(month.format("yyyy-MM-01"), acctId),
  });
  const navigate = useNavigate();

  const fontColorOnType = (debitId, creditId) => {
    if (debitId == creditId) return "primary.light";
    if (acctId == creditId) {
      return "error.light";
    } else {
      return "success.light";
    }
  };

  const data = useMemo(() => {
    const totals = {
      deposit: 0,
      withdrawal: 0,
      total: 0,
    };
    const acctBalanceInternal = { ...acctBalance };
    if (!acctBalance)
      return {
        dates: [],
        totals,
      };

    let rec = (records || [])
      .filter((e) => [e.creditId, e.debitId].includes(acctId))
      .sort((a, b) => (a.date < b.date ? -1 : a.id < b.id ? -1 : 1))
      .map((tr: TransactionWithRunningBal) => {
        acctBalanceInternal.balance += tr.creditId === acctId ? -tr.amount : 0;
        acctBalanceInternal.balance += tr.debitId === acctId ? tr.amount : 0;

        tr.runningBalance = acctBalanceInternal.balance;

        return tr;
      })
      .sort((a, b) => (a.date > b.date ? -1 : a.id > b.id ? -1 : 1))
      .reduce<RecordViewTransaction[]>((prev, current, index) => {
        let date = prev.find(
          (e) => e.dateGroup == moment(current.date).format("yyyy-MM-DD"),
        );
        if (!date) {
          date = {
            dateGroup: moment(current.date).format("yyyy-MM-DD"),
            day: moment(current.date).date(),
            dayOfWeek: moment(current.date).format("ddd"),
            items: [],
            income: 0,
            expenses: 0,
          };
          prev.push(date);
        }
        date.items.push(current);

        if (acctId == current.creditId) {
          date.expenses += current.amount;
          totals.withdrawal += current.amount;
          totals.total -= current.amount;
        } else {
          date.income += current.amount;
          totals.deposit += current.amount;
          totals.total += current.amount;
        }

        switch (current.type) {
          case "expense":
            break;
          case "income":
            break;
        }
        return prev;
      }, []);
    return {
      dates: rec,
      totals,
    };
  }, [records, acctId, acctBalance]);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Grid
            container
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Grid item onClick={() => navigate(-1)}>
              <IconButton sx={{ mr: 1 }}>
                <ArrowLeft />
              </IconButton>
              {account?.name}
            </Grid>
            <Grid item>
              <IconButton
                onClick={() => setMonth(month.clone().add(-1, "month"))}
              >
                <IcoChevronLeft />
              </IconButton>
              <span className="my-1">{month.format("MMM yyyy")}</span>
              <IconButton
                onClick={() => setMonth(month.clone().add(1, "month"))}
              >
                <IcoChevronRight />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Grid container spacing={1} sx={{ mt: 2 }}>
        <Grid item md={5} sx={{ display: { xs: "none", md: "block" } }}>
          Charts Here
        </Grid>
        <Grid item md={7} xs={12}>
          <Paper sx={{ my: 1, p: 2 }}>
            <Grid
              container
              sx={{ textAlign: "center", justifyContent: "space-around" }}
            >
              <Grid item>
                Deposit
                <br />
                <Typography
                  color="success.main"
                  sx={{ px: 1, alignSelf: "center" }}
                  variant="transactionHeaderDate"
                >
                  {numeral(data.totals.deposit).format("0,0.00")}
                </Typography>
              </Grid>
              <Grid item>
                Withdrawal
                <br />
                <Typography
                  color="danger.main"
                  sx={{ px: 1, alignSelf: "center" }}
                  variant="transactionHeaderDate"
                >
                  {numeral(data.totals.withdrawal).format("0,0.00")}
                </Typography>
              </Grid>
              <Grid item>
                Total
                <br />
                <Typography
                  sx={{ px: 1, alignSelf: "center" }}
                  variant="transactionHeaderDate"
                >
                  {numeral(data.totals.total).format("0,0.00")}
                </Typography>
              </Grid>
              <Grid item>
                Balance
                <br />
                <Typography
                  sx={{ px: 1, alignSelf: "center" }}
                  variant="transactionHeaderDate"
                >
                  {numeral(acctBalance?.endingBalance).format(
                    "0,0.00",
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          {data.dates.map((data) => (
              <Paper key={data.dateGroup} sx={{ my: 1 }}>
              <List>
                <ListItem
                  dense
                  onClick={() =>
                    navigate(
                      "/transactions/new?date=" +
                        data.dateGroup +
                        "&creditId=" +
                        acctId,
                    )
                  }
                >
                  <Grid item xs={6}>
                    <Typography sx={{ px: 1 }} variant="transactionHeaderDate">
                      {data.day}
                    </Typography>{" "}
                    <Chip label={data.dayOfWeek} sx={{ mr: 1 }}></Chip>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      textAlign: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      color="green"
                      sx={{ px: 1, alignSelf: "center", fontColor: "success" }}
                      variant="transactionHeaderDate"
                    >
                      {numeral(data.income).format("0,0.00")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      textAlign: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      color="red"
                      sx={{ px: 1, alignSelf: "center", fontColor: "danger" }}
                      variant="transactionHeaderDate"
                    >
                      {numeral(data.expenses).format("0,0.00")}
                    </Typography>
                  </Grid>
                </ListItem>
                <Divider />
                      {data.items.map((item) => (
                <ListItem
                    key={ item.id }
                    onClick={() => navigate("../../transactions/" + item.id)}
                  >
                    <Grid container>
                      <Grid item xs={3}>
                        <Typography sx={{ px: 1 }} variant="body1">
                          {item.type === "transfer"
                            ? "Transfer"
                            : item.type === "expense"
                              ? item.debit.name
                              : item.credit.name}
                        </Typography>
                        <Typography sx={{ px: 1 }} variant="body1">
                          {item.vendor?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography sx={{ fontWeight: 600 }} variant="body1">
                          {item.description || ""}
                        </Typography>
                        {item.type == "transfer"
                          ? item.credit.name + " => " + item.debit.name
                          : item.type == "expense"
                            ? item.credit.name
                            : item.debit.name}
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: "right", px: 1 }}>
                        <Typography
                          color={fontColorOnType(item.debitId, item.creditId)}
                          sx={{ fontWeight: 600 }}
                        >
                          P {numeral(item.amount).format("0,0.00")}
                        </Typography>
                        {numeral(item.runningBalance).format("0,0.00")}
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}
        </Grid>
      </Grid>
          <Link to="/transactions/new" state={{credit:account} }>
              <Fab color="primary" sx={fabGreenStyle}>
        <Add fontSize="large"/> 
          {/*<FontAwesomeIcon color="inherit" icon={faPlus} size="xl" />*/}
        </Fab>
      </Link>
    </>
  );
};

export default ViewAccount;
