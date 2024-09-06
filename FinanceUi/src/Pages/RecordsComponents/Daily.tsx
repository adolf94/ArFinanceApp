import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import { Transaction } from "FinanceApi";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { RecordsContext } from "../Records";

interface DailyViewProps {
  records: Transaction[];
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

  const fontColorOnType = (type) => {
    switch (type) {
      case "expense":
        return "error.light";
      case "income":
        return "success.light";
      case "transfer":
        return "primary.light";
    }
  };

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
        <Paper sx={{ my: 1 }}>
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
            {data.items.map((item) => (
              <ListItem onClick={() => navigate("../transactions/" + item.id)}>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">
                      {item.type == "transfer"
                        ? "Transfer"
                        : item.type == "expense"
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
                  <Grid item xs={4} sx={{ textAlign: "right" }}>
                    <Typography
                      color={fontColorOnType(item.type)}
                      sx={{ px: 1, fontWeight: 600 }}
                      variant="body1"
                    >
                      P{" "}
                      {item.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
};

export default Daily;
