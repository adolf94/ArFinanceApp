import {
    Alert,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { Transaction } from "FinanceApi";
import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { RecordsContext } from "../Records";

import { useQueryClient } from "@tanstack/react-query";
import TransactionListItem from "./TransactionListItem";
interface DailyViewProps {
    records: Transaction[];
    loading: boolean;
}

interface RecordViewTransaction {
  dateGroup: string;
  day: number;
  dayOfWeek: string;
  items: Transaction[];
  expenses: number;
  income: number;
}


const Daily = (props: DailyViewProps) => {
  const { records, totals } = useContext(RecordsContext);

  const navigate = useNavigate();

  return (
    <Box sx={{ my: 1, maxHeight: "80vh", overflow: "overlay" }}>
      <Paper sx={{ p: 1, my: 1 }}>
        <Grid
          container
          sx={{ display: "flex", justifyContent: "space-around" }}
        >
          <Grid item sx={{ textAlign: "center" }}>
            <Typography
              color="success"
              sx={{ px: 1, alignSelf: "center" }}
              variant="transactionHeaderDate"
            >
              Income
            </Typography>
            <br />
            <Typography
              color="success.light"
              sx={{ px: 1, alignSelf: "center" }}
              variant="transactionHeaderDate"
            >
              {totals.income.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Grid>
          <Grid item sx={{ textAlign: "center" }}>
            <Typography
              color="error"
              sx={{ px: 1, alignSelf: "center", display: "block" }}
              variant="transactionHeaderDate"
            >
              Expense
            </Typography>
            <Typography
              color="error.main"
              sx={{
                px: 1,
                alignSelf: "center",
                display: "block",
                fontColor: "success",
              }}
              variant="transactionHeaderDate"
            >
              {totals.expense.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Grid>
          <Grid item sx={{ textAlign: "center" }}>
            <Typography
              sx={{ px: 1, alignSelf: "center", display: "block" }}
              variant="transactionHeaderDate"
            >
              Total
            </Typography>
            <Typography
              sx={{
                px: 1,
                alignSelf: "center",
                display: "block",
                fontColor: "success",
              }}
              variant="transactionHeaderDate"
            >
              {totals.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      {records.map((data) => (
          <Paper sx={{ my: 1 }} key={data.dateGroup}>
          <List>
            <ListItem
              dense
              onClick={() =>
                navigate("/transactions/new?date=" + data.dateGroup)
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
                  {data.income.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
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
                  {data.expenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Typography>
              </Grid>
            </ListItem>
            <Divider />
                  {data.items.map((item) => <TransactionListItem item={item} />)}
          </List>
        </Paper>
      ))}
          {props.loading && <Paper sx={{ my: 1 }}>
              <List>
                  <ListItem dense>
                      <Grid item xs={6}>
                          <Typography sx={{ px: 1 }} variant="transactionHeaderDate">
                              <Skeleton variant="text" />
                          </Typography>{" "}
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
                              <Skeleton variant="text" width="5rem" />

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
                              <Skeleton variant="text" width="5rem" />
                          </Typography>
                      </Grid>
                  </ListItem>
                  <Divider />
                  <TransactionListItem item={{}} loading={true} />
                  <TransactionListItem item={{}} loading={true} />
                  <TransactionListItem item={{}} loading={true} />
              </List>
          </Paper>
          }
    </Box>
  );
};

export default Daily;
