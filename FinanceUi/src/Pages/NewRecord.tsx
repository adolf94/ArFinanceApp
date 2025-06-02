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
export const SelectAccountContext = createContext({});
//const useStyles = makeStyles({

//  dialogHalf: {
//    position: "absolute",
//    top: "80%",
//    left: "50%",
//    transform: "translate(-50%, -50%)"
//  }
//});/

const NewRecordPage = (props) => {
  const theme = useTheme();
  const con = useRef();
  const navigate = useNavigate();
  //const styles = useStyles();
  const sm = useMediaQuery(theme.breakpoints.down("md"));
  const [reRender, setRerender] = useState(true)




  const [selectView, setSelectView] = useState({
    groupId: null,
    onChange: () => {},
    type: "",
    searchValue: "",
  });
  useEffect(() => {
    if(reRender) {
      setRerender(false)
    }
  }, [reRender])

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
        <Grid container sx={{flexDirection:'row-reverse'}}>
          <Grid item xs={6}>
            <Box ref={con}></Box>
          </Grid>
          <Grid item xs={12} lg={6}>
            <NewRecordForm
              selectPortal={con.current}
            />
          </Grid>

        </Grid>
      </SelectAccountContext.Provider>
    </>
  );
};

export default NewRecordPage;
