import { Box, Grid2 as Grid, Paper, Typography } from "@mui/material";
import { Transaction } from "FinanceApi";
import moment from "moment";
import React, { useContext, useState } from "react";
import { RecordsContext } from "../Records";
import { useEffect } from "react";
import numeral from "numeral";

interface CalendarProps {
  records: Transaction[];
}

interface calendarViewData {
  dayOfMonth: number;
  date: Date;
  dateISO: string;
  dayOfWeek: number;
  week: number;
  isCurrentMonth: boolean;
  hasRecord?: boolean;
  totals?: { income: number; expense: number; total: number };
}

const generateCalendarArray = (month: Date) => {
  let day = moment(month).date(1);
  let days: any[] = [];
  let NextOfMonth = moment(month).date(1).add(1, "month");
  while (day.isBefore(NextOfMonth)) {
    let item = {
      dayOfMonth: day.date(),
      date: day.toDate(),
      dateISO: day.toISOString(),
      dayOfWeek: day.weekday(),
      week: day.week(),
      isCurrentMonth: true,
    };
    days.push(item);
    day = day.clone().add(1, "day");
  }

  return days.reduce((prev, item, index) => {
    if (!prev[item.week]) prev[item.week] = [];
    let i = 0;
    while (item.dayOfWeek > i && moment(item.date).date() == 1) {
      let thisDay = moment(item.date).clone().day(i);
      prev[item.week].push({
        dayOfMonth: thisDay.date(),
        date: thisDay.toDate(),
        dateISO: thisDay.toISOString(),
        dayOfWeek: thisDay.weekday(),
        week: thisDay.week(),
        isCurrentMonth: false,
      });
      i++;
    }
    prev[item.week].push(item);

    if (item.dayOfWeek < 6 && index == days.length - 1) {
      let i = item.dayOfWeek + 1;
      while (i < 7) {
        let thisDay = moment(item.date).clone().day(i);
        prev[item.week].push({
          dayOfMonth: thisDay.date(),
          date: thisDay.toDate(),
          dateISO: thisDay.toISOString(),
          dayOfWeek: thisDay.weekday(),
          week: thisDay.week(),
          isCurrentMonth: false,
        });
        i++;
      }
    }

    return prev as calendarViewData;
  }, {});
};

const Calendar = (props: CalendarProps) => {
  const { records, totals, month } = useContext(RecordsContext);
  const [view, setView] = useState([]);

  useEffect(() => {
    let data = generateCalendarArray(month.toDate());

    let dataArray = Object.keys(data).map((e) => {
      return data[e].map((day: calendarViewData) => {
        let dayData = records.find((d) => d.day == day.dayOfMonth);
        if (!dayData) {
          day.hasRecord = false;
          day.totals = { income: 0, expense: 0, total: 0 };
          return day;
        }
        day.hasRecord = dayData.items.length > 0;
        let { income, expenses } = dayData;
        day.totals = { income, expense: expenses, total: income - expenses };
        return day;
      });
    });

    setView(dataArray);
  }, [records]);

  return (
    <Box sx={{ my: 1, maxHeight: "80vh", overflow: "overlay" }}>
      <Paper sx={{ p: 1, my: 1 }}>
        <Grid
          container
          columns={7}
          sx={{
            border: 1,
            borderStyle: "solid",
            borderColor: "gray",
            textAlign: "center",
          }}
        >
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Sun</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Mon</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Tue</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Wed</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Thu</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Fri</Typography>
          </Grid>
          <Grid
            size={1}
            sx={{
              borderRight: 1,
              borderStyleRight: "solid",
              borderColorRight: "gray",
              py: 2,
            }}
          >
            <Typography variant="body2">Sat</Typography>
          </Grid>
        </Grid>
        {view.map((week,index) => (
          <Grid
            container
            columns={7}
            key={index}
            sx={{ border: 1, borderStyle: "solid", borderColor: "gray" }}
          >
            {week.map((day) => (
              <Grid
                size={1}
                    key={day.dateISO }
                sx={{
                  borderRight: 1,
                  borderStyleRight: "solid",
                    borderColorRight: "gray",
                  paddingRight:'4px',
                    paddingBottom: 1,
                  fontSize:'x-small'
                }}
              >
                <Box sx={{pl:'4px',pt:'2px'}}>
                  
                  <Typography variant="body1">{day.dayOfMonth}</Typography>
                </Box>
                {!day.isCurrentMonth ? (
                  <Box></Box>
                ) : (
                  <Box sx={{ textAlign: "right", minHeight: "3em" }}>
                    <Box>
                      {day.hasRecord &&
                        numeral(day.totals?.income).format("0,0.00")}
                    </Box>
                    <Box>
                      {day.hasRecord &&
                        numeral(day.totals?.expense).format("0,0.00")}
                    </Box>
                    <Box>
                      {day.hasRecord &&
                        numeral(day.totals?.total).format("0,0.00")}
                    </Box>
                  </Box>
                )}
              </Grid>
            ))}
          </Grid>
        ))}
      </Paper>
    </Box>
  );
};

export default Calendar;
