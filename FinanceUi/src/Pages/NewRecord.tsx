import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import React, { useState, createContext, useRef, useEffect } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
//import { makeStyles } from '@emotion/styles'

import NewRecordForm from "./NewRecordComponents/NewRecordForm";
import moment from "moment";
import { ChevronLeft } from "@mui/icons-material";
import { ScheduledTransactions, Transaction } from "FinanceApi";
import { useQueryClient } from "@tanstack/react-query";
import { v4,v7 } from 'uuid'
import {
  TRANSACTION,
  fetchTransactionById,
} from "../repositories/transactions";
import { ACCOUNT, fetchByAccountId } from "../repositories/accounts";
import { getToken } from "../components/api";

export const SelectAccountContext = createContext({});
//const useStyles = makeStyles({

//  dialogHalf: {
//    position: "absolute",
//    top: "80%",
//    left: "50%",
//    transform: "translate(-50%, -50%)"
//  }
//});/

const defaultValue = {
  type: "expense",
  date: moment().toISOString(),
  credit: null,
  debit: null,
  amount: null,
  vendor: null,
  description: "",
};
const NewRecordPage = (props) => {
  const [formData, setFormData] = useState<
    Partial<Transaction | ScheduledTransactions>
      >({ ...defaultValue, id: v7() });
  const theme = useTheme();
  const con = useRef();
  const queryClient = useQueryClient();
  const { transId } = useParams();
  const [query, setQuery] = useSearchParams();
  const navigate = useNavigate();
    const { state } = useLocation() as { state: any };
  const resetFormData = ()=>{
    setFormData({ ...defaultValue,credit:formData.credit, creditId:formData.creditId, date: formData.date, id: v7() })
  }
    useEffect(() => {
        getToken();
    (async () => {
      if (
        transId == "new" ||
        (!!query.get("date") && moment(query.get("date")).isValid())
      ) {
        let date = query.get("date")
          ? moment(query.get("date"))
              .hour(moment().hour())
              .minute(moment().minute())
              .toISOString()
          : moment().toISOString();
        let credit = query.get("creditId")
          ? await queryClient.ensureQueryData({
              queryKey: [ACCOUNT, { id: query.get("creditId") }],
              queryFn: () => fetchByAccountId(query.get("creditId")),
            })
          : null;
          setFormData({ ...defaultValue, id: v4(), date, credit, creditId: credit?.id });
      } else {
        queryClient
          .fetchQuery({
            queryKey: [TRANSACTION, { id: transId }],
            queryFn: () => fetchTransactionById(transId),
          })
          .then((e) => setFormData(e));
      }
    })();
  }, [transId, query, queryClient]);

  //const styles = useStyles();
  const sm = useMediaQuery(theme.breakpoints.down("md"));

useEffect(() => {
    if (!!state?.credit) {
        setFormData(prev => ({ ...prev, credit: state.credit, creditId: state.credit?.id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [state?.credit, setFormData])

  const [selectView, setSelectView] = useState({
    groupId: null,
    onChange: () => {},
    type: "",
    searchValue: "",
  });

  const setViewContext = (data) => {
    setSelectView({ ...selectView, ...data });
  };
  return (
    <>
      {" "}
      <AppBar position="static">
        <Toolbar>
          <Link to="..." onClick={() => navigate(-1)}>
            <IconButton size="large">
              {/*<FontAwesomeIcon icon={faArrowLeftLong} />*/}
              <ChevronLeft />
            </IconButton>
          </Link>
          <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
            New
          </Typography>
        </Toolbar>
      </AppBar>
      <SelectAccountContext.Provider value={{ ...selectView, setViewContext }}>
        <Grid container>
          <Grid item xs={12} lg={6}>
            <NewRecordForm
              formData={formData}
              resetFormData={resetFormData}
              selectPortal={con.current}
              setFormData={setFormData}
            />
          </Grid>

          <Grid item sm={6}>
            <Box ref={con}></Box>
          </Grid>
        </Grid>
      </SelectAccountContext.Provider>
    </>
  );
};

export default NewRecordPage;
