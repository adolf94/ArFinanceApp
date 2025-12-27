import {
    faChevronLeft,
    faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    AppBar,
    Box,
    Fab,
    Grid2 as Grid,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Toolbar,
    colors,
    Button,ButtonGroup
} from "@mui/material";
import { createContext, useState, useMemo } from "react";
import AccountsPage from "./Accounts";

import { Add, ControlPointDuplicateOutlined, ControlPointOutlined, Refresh } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "FinanceApi";
import moment from "moment";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    fetchTransactionsByMonthKey,
} from "../repositories/transactions";
import Calendar from "./RecordsComponents/Calendar";
import Daily from "./RecordsComponents/Daily";
import UserPanel from "../components/UserPanel.js";
import { useOfflineData } from "../components/LocalDb/useOfflineData";
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../components/LocalDb";
import TotalTab from "./RecordsComponents/Total";
import useDexieDataWithQuery from "../components/LocalDb/useOfflineData2";

interface RecordViewTransaction {
  dateGroup: string;
  day: number;
  dayOfWeek: string;
  items: Transaction[];
  expenses: number;
  income: number;
}
interface RecordsContextValue {
  records: RecordViewTransaction[];
  totals: { income: number; expense: number; total: number };
  month: moment.Moment;
}
const defaultRecordsValue: RecordsContextValue = {
  records: [],
  totals: { income: 0, expense: 0, total: 0 },
  month: moment(),
};
export const RecordsContext = createContext(defaultRecordsValue);

const fabStyle = {};

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

const fabDefaultStyle = {
  position: "absolute",
  bottom: 72,
  right: 80,
  color: "common.white",
  bgcolor: colors.grey[500],
  "&:hover": {
    bgcolor: colors.grey[600],
  },
};

const Records = () => {
  const { view, monthStr } = useParams();
  const month = moment(monthStr);
    const navigate = useNavigate();
  

    const { isLoading:loadingRecords, refetch, isFetching } = useOfflineData({
        defaultData: [],
        offlineOnly : false,
        initialData: ()=>fetchTransactionsByMonthKey(month.get("year"), month.get("month"), true),
        getOnlineData: ()=>fetchTransactionsByMonthKey(month.get("year"), month.get("month"), false)
    }, [monthStr])

    // const {data: monthData} = useDexieDataWithQuery({
    //   dexieData: db.
    // })


  const records = useLiveQuery(async ()=>{
    let key = moment([month.get("year"),  month.get("month"),1]).format("YYYY-MM-01")
    let monthData = await db.monthTransactions.where("monthKey").equals( key ).first();
    if(!monthData) return null;
    return Promise.all( 
      monthData.transactions.map((tr)=>{
        return db.transactions.where("id").equals(tr.id).first()
      }))
  }, [month.get("year"),  month.get("month")])

  const [dailies, setDailies] = useState([]);

  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });




    const setMonth = (newDate) => {
        navigate(`../records/${moment(newDate).format("YYYY-MM")}/${view}`)

    }

  const handleChange = (event, newValue) => {
    //setValue(newValue);
      navigate(`../records/${monthStr}/${newValue}`)
  };

  useEffect(() => {
    const totals = {
      income: 0,
      expense: 0,
      total: 0,
    };
    let rec = (records || [])
      .sort((a, b) => (a.date > b.date ? -1 : 1))
      .reduce((prev : RecordViewTransaction[], current :Transaction ) => {
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
              switch (current.type) {
                  case "expense":
                      date.expenses += current.amount;
                      totals.expense += current.amount;
                      totals.total -= current.amount;
                      break;
                  case "income":
                      date.income += current.amount;
                      totals.income += current.amount;
                      totals.total += current.amount;
                      break;
              }
              return prev;
          },
          []);
    setTotals(totals);
    setDailies(rec);
  }, [records]);

    useEffect(() => {
        let goToView = view || "daily";
        let goToMonthStr = monthStr || moment().format("YYYY-MM")
        if (!view || !monthStr) navigate(`${goToMonthStr}/${goToView}`)
    }, [view,monthStr]);

  return (
    <>
      <AppBar position="static"  color="primary">
        <Toolbar>
            <Grid container sx={{width:"100%",justifyContent: "space-between"}}>
                <Grid>
                    <IconButton onClick={() => setMonth(month.clone().add(-1, "month"))}>
                        <FontAwesomeIcon
                            icon={faChevronLeft}
                        />
                    </IconButton>
                    <span className="my-1">{month.format("MMM yyyy")}</span>
                    <IconButton onClick={() => setMonth(month.clone().add(1, "month"))}>
                        <FontAwesomeIcon
                            icon={faChevronRight}
                        />
                    </IconButton>
                </Grid>
                <Grid>
                    <UserPanel />
                </Grid>
            </Grid>
         
        </Toolbar>
      </AppBar>
      <Grid container width="100%" spacing={1}>
        <Grid size={{md:4}} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ mt: 3 }}>
                  <Box sx={{px:2}}>
                      <ButtonGroup fullWidth >
                          <Button variant="contained" color="primary" 
                          onClick={()=>navigate("/transactions/new")}>
                              <ControlPointOutlined/> Add Record
                          </Button>
                        <Button variant="contained" color="primary" 
                          sx={{minWidth: 'auto', width:"5rem"}}
                          size="small">
                            <ControlPointDuplicateOutlined/>
                        </Button>
                      </ButtonGroup>
                  </Box>
              <Box sx={{ my: 1, maxHeight: "75vh", overflow: "overlay" }}>
                <AccountsPage />
              </Box>
          </Paper>
        </Grid>
        <Grid container size={{xs:12,md:8}} sx={{display:"block"}}>
          <Grid container size={12} sx={{ borderBottom: 1, borderColor: "divider", justifyContent:"space-between"}} >
            <Box sx={{display:"flex"}}>
              <Tabs
                value={view || "daily"}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Daily" value="daily" />
                <Tab label="Calendar" value="calendar" />
                {/* <Tab label="Weekly" value="weekly" />
                <Tab label="Monthly" value="monthly" /> */}
                <Tab label="Total" value="total" />
              </Tabs>
            </Box>
            <Box sx={{display:"flex"}}>
              <IconButton onClick={refetch}>
                <Refresh />
              </IconButton>
            </Box>
          </Grid>
          <Grid size={12}>
            <RecordsContext.Provider value={{ records: dailies, totals, month }}>
              <div role="tabpanel" hidden={view !== "daily"}>
                            <Daily records={records} loading={loadingRecords} isFetching={isFetching}/>
              </div>
              <div role="tabpanel" hidden={view !== "calendar"}>
                <Calendar records={records || []} />
              </div>
              <div role="tabpanel" hidden={view !== "total"}>
                <TotalTab records={records} date={month.format("YYYY-MM-01")}/>
              </div>
            </RecordsContext.Provider>
          </Grid>
        </Grid>
      </Grid>
      <Link to="/transactions/new">
        <Fab color="primary" sx={{...fabGreenStyle,display:{md:'none'}}} >
            <Add fontSize="large"/> 
        </Fab>
      </Link>
      {/* <Link to="/transactions/new">
        <Fab color="primary" size="small" sx={{...fabDefaultStyle, display:{md:'none'}}} >
            <Add fontSize="small" color="warning" /> 
        </Fab>
      </Link> */}
    </>
  );
};

export default Records;
