import React, { useEffect, useState } from "react";
import {
  Divider,
  List,
  useMediaQuery,
  ListItem,
  ListItemText,
  Grid2 as Grid,
  ListItemButton,
  Stack,
  Box,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_GROUP, fetchGroups } from "../repositories/accountgroups";
import { fetchAccounts, ACCOUNT } from "../repositories/accounts";
import { Account } from "FinanceApi";
import numeral from "numeral";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CreditStatementBalance from "./Accounts/CreditCardBalance";

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
  <Grid size={12}>
        {(loadingGroups || loadingAccts) && <Box sx={{ textAlign: "center" }}>
          <CircularProgress />
        </Box>}
      <List onLoad={() => {}}>
        {(accountGroups || [])
            .filter(e=>["892f20e5-b8dc-42b6-10c9-08dabb20ff77"].includes(e.accountTypeId))
            .map((e) => (
          <React.Fragment key={e.id}>
            <Divider textAlign="left" key={e.id}>
              {e.name}
            </Divider>
            {(accounts || [])
              .filter((a) => e.id === a.accountGroupId && !a.resetEndOfPeriod)
              
              .map((a: Account) => (
                <ListItem dense key={a.id}>
                  <Grid container sx={{ pt: 1, width:'100%' }}>
                    <Grid size={a.periodStartDay===1 ? 9:6}>
                      <Grid
                        key={e.id}
                        onClick={() => navigate("/accounts/" + a.id)}
                      >
                        <Typography variant="body1">
                          {a.name}
                        </Typography>
                      </Grid>
                    </Grid>
                   {/* {a.periodStartDay !== 1 && (
                      <CreditStatementBalance
                        account={a}
                        date={moment().toDate()}
                      />
                    )} */}
                     {
                     a.periodStartDay !== 1 ? 
                     <CreditStatementBalance
                     account={a}
                     date={moment().toDate()}
                   /> :
                     
                      <Grid
                        size={3}
                        sx={{ alignContent: "center", textAlign: "end" }}
                      >
                        <Typography variant="body1">
                          {numeral(a.balance).format("0,0.00")}
                        </Typography>
                      </Grid>
                    }
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
