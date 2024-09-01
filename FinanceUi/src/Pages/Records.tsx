
import { Chip, Divider, Fab, ListItem, Toolbar, Typography, colors } from '@mui/material'
import React, { createContext, useState } from 'react'
import { IconButton, AppBar, List, Grid, Paper, Box, Tab, Tabs} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons'
import AccountsPage from './Accounts'

import { Link, useMatch, useNavigate, useParams } from 'react-router-dom'
import moment from 'moment'
import { useEffect } from 'react'
import Daily from './RecordsComponents/Daily'
import { useQuery } from '@tanstack/react-query'
import { TRANSACTION, fetchTransactionsByMonth } from '../repositories/transactions'
import Calendar from './RecordsComponents/Calendar'
import { Transaction } from 'FinanceApi'


interface RecordViewTransaction {
  dateGroup: string,
  day: number,
  dayOfWeek: string,
  items: Transaction[],
  expenses: number,
  income: number
}
interface RecordsContextValue {
  records: RecordViewTransaction[],
  totals: { income: number, expense: number, total: number },
  month : moment.Moment
}
 const defaultRecordsValue: RecordsContextValue = {
  records: [],
   totals: { income: 0, expense: 0, total: 0 },
  month: moment()
}
export const RecordsContext = createContext(defaultRecordsValue)


const fabStyle = {
};

const fabGreenStyle = {
  position: 'absolute',
  bottom: 72,
  right: 16,
  color: 'common.white',
  bgcolor: colors.green[500],
  '&:hover': {
    bgcolor: colors.green[600],
  },
};


const Records = () => {
  const [value, setValue] = useState("daily");
  const [month, setMonth] = useState(moment())
  const { view } = useParams()
  const navigate = useNavigate()
  const { data: records } = useQuery({
    queryKey: [TRANSACTION, { month: month.get("month") + 1, year: month.get("year") }],
      queryFn: () => fetchTransactionsByMonth(month.get("year"), month.get("month") + 1),
  })

  const [dailies, setDailies] = useState([])

  const [totals, setTotals] = useState({
    income: 0,
    expense: 0,
    total: 0
  })

  const handleChange = (event, newValue) => {
    //setValue(newValue);
    navigate("../records/" + newValue)
  };


  useEffect(() => {
    const totals = {
      income: 0,
      expense: 0,
      total: 0
    }
    let rec = (records||[]).sort((a, b) => ((a.date > b.date) ? -1 : 1)).reduce<RecordViewTransaction[]>((prev, current, index) => {
      let date = prev.find(e => (e.dateGroup == moment(current.date).format("yyyy-MM-DD")))
      if (!date) {
        date = {
          dateGroup: moment(current.date).format("yyyy-MM-DD"),
          day: moment(current.date).date(),
          dayOfWeek: moment(current.date).format("ddd"),
          items: [],
          income: 0,
          expenses: 0
        }
        prev.push(date)
      }
      date.items.push(current)
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
    }, [])
    setTotals(totals)
    setDailies(rec)
  }, [records])

  useEffect(() => {
    if(!view) navigate("daily")
  },[view])

  return <>
    <AppBar position="static">
      <Toolbar>
        <IconButton>
          <FontAwesomeIcon icon={faChevronLeft} onClick={() => setMonth(month.clone().add(-1, "month"))} />
        </IconButton>
        <span className="my-1">{month.format("MMM yyyy")}</span>
        <IconButton>
          <FontAwesomeIcon icon={faChevronRight} onClick={()=>setMonth(month.clone().add(1,"month"))} />
        </IconButton>
      </Toolbar>
    </AppBar>
    <Grid container spacing={1}>
      <Grid item md={4} sx={{ display: {xs:'none', md:'block'} }}>
        <Paper sx={{mt:3}}>
          <AccountsPage />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={view} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Daily" value="daily" />
            <Tab label="Calendar" value="calendar" />
            <Tab label="Weekly" value="weekly" />
            <Tab label="Monthly" value="monthly" />
            <Tab label="Total" value="total" />
          </Tabs>
        </Box>
        <RecordsContext.Provider value={{records:dailies,totals, month}}>
          <div role="tabpanel" hidden={view != "daily"}>
            <Daily records={(records||[])} />
          </div>
          <div role="tabpanel" hidden={view != "calendar"}>
            <Calendar records={(records || [])} />
          </div>
          <div role="tabpanel" hidden={view != ""}>
            3
          </div>
        </RecordsContext.Provider>
      </Grid>

    </Grid>
    <Link to="/transactions/new">
      <Fab color="primary" sx={fabGreenStyle}>
        <FontAwesomeIcon color="inherit" icon={faPlus} size="xl" />
      </Fab>
    </Link> 
  </>
}

export default Records