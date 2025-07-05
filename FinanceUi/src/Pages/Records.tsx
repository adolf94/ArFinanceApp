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
    Button
} from "@mui/material";
import { createContext, useState, useMemo } from "react";
import AccountsPage from "./Accounts";

import { Add } from "@mui/icons-material";
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

const Records = () => {
  const { view, monthStr } = useParams();
  const month = moment(monthStr);
    const navigate = useNavigate();
  //   const { data: records, isLoading: loadingRecords  } = useQuery({
  //   queryKey: [
  //     TRANSACTION,
  //     { month: month.get("month") , year: month.get("year") },
  //   ],
  //   queryFn: () =>
  //     fetchTransactionsByMonthKey(month.get("year"), month.get("month"), false),
  //   placeholderData:[]
  // });
    //const records = useMemo(()=>[],[])

    const { isLoading:loadingRecords } = useOfflineData({
        defaultData: [],
        offlineOnly : false,
        initialData: ()=>fetchTransactionsByMonthKey(month.get("year"), month.get("month"), true),
        getOnlineData: ()=>fetchTransactionsByMonthKey(month.get("year"), month.get("month"), false)
    }, [monthStr])

  const records = useLiveQuery(async ()=>{
    let key = moment([month.get("year"),  month.get("month"),1]).format("YYYY-MM-01")
    let monthData = await db.monthTransactions.where("monthKey").equals( key ).first();
    if(!monthData) return null;
    return Promise.all( monthData.transactions.map((tr)=>{
      return db.transactions.where("id").equals(tr.id).first()
    }))
  }, [month.get("year"),  month.get("month")])

  const [dailies, setDailies] = useState([]);

  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });

    //useEffect(() => {
    //    console.debug("called useOfflineData useEffect " )
    //    let mode = "offline"
    //    //if (!isLoading) return;
    //    //setLoading(true)
    //    //const fetch = () => {
    //    //fetching = true
    //    ////setFetching(true)
    //    //inputs.getOnlineData().then((data) => {
    //    //    setData(data)
    //    //    mode = "online"
    //    //    setFetching(false)
    //    //    setLoading(false)
    //    //}).catch(() => {
    //    //    //setFetching(false)
    //    //    //setLoading(false)
    //    //})
    //    if (mode === "online") return;
    //    fetchTransactionsByMonthKey(month.get("year"), month.get("month"), false).then((data) => {
    //        setRecords(data)
    //        mode = "online"
    //        setLoading(false)
    //    })

    //    fetchTransactionsByMonthKey(month.get("year"), month.get("month"), true).then((data) => {
    //        setLoading(false)
    //        if (mode === "offline") setRecords(data)
    //        //if (!fetching && !fetched && !inputs.offlineOnly ) fetch()
    //    })



    //}, [monthStr])




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
              <Link to="/transactions/new">
                  <Box sx={{px:2}}>
                      <Button variant="contained" fullWidth color="primary">
                          <Add/> Add Record
                      </Button>
                  </Box>
              </Link>
              <Box sx={{ my: 1, maxHeight: "75vh", overflow: "overlay" }}>
                <AccountsPage />
              </Box>
          </Paper>
        </Grid>
        <Grid size={{xs:12,sm:8}}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={view}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Daily" value="daily" />
              <Tab label="Calendar" value="calendar" />
              <Tab label="Weekly" value="weekly" />
              <Tab label="Monthly" value="monthly" />
              <Tab label="Total" value="total" />
            </Tabs>
          </Box>
          <RecordsContext.Provider value={{ records: dailies, totals, month }}>
            <div role="tabpanel" hidden={view !== "daily"}>
                          <Daily records={records} loading={loadingRecords} />
            </div>
            <div role="tabpanel" hidden={view !== "calendar"}>
              <Calendar records={records || []} />
            </div>
            <div role="tabpanel" hidden={view !== ""}>
              3
            </div>
          </RecordsContext.Provider>
        </Grid>
      </Grid>
      <Link to="/transactions/new">
        <Fab color="primary" sx={{...fabGreenStyle,display:{md:'none'}}} >
            <Add fontSize="large"/> 
        </Fab>
      </Link>
    </>
  );
};

export default Records;
