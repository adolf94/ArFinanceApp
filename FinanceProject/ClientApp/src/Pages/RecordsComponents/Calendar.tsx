import { Box, Grid, Paper } from "@mui/material"
import { Transaction } from "FinanceApi"
import moment from "moment"
import React, { useContext, useState } from 'react'
import { RecordsContext } from "../Records"
import { useEffect } from "react"

interface CalendarProps {
  records: Transaction[]
}

interface calendarViewData {
  dayOfMonth: number,
  date: Date,
  dateISO: string,
  dayOfWeek: number,
  week: number,
  isCurrentMonth: boolean,
  hasRecord?: boolean,
  totals?: {income: number, expense:number, total:number}
} 

const generateCalendarArray = (month: Date)  => {
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
      isCurrentMonth: true
    }
    days.push(item)
    day = day.clone().add(1, 'day')
  }

  return days.reduce((prev, item, index) => {
    if (!prev[item.week]) prev[item.week] = [];
    let i = 0
    while (item.dayOfWeek > i && moment(item.date).date() == 1) {
      let thisDay = moment(item.date).clone().day(i)
      prev[item.week].push({
        dayOfMonth: thisDay.date(),
        date: thisDay.toDate(),
        dateISO: thisDay.toISOString(),
        dayOfWeek: thisDay.weekday(),
        week: thisDay.week(),
        isCurrentMonth: false
      })
      i++
    }
    prev[item.week].push(item)

    if (item.dayOfWeek < 6 && (index == days.length - 1)) {
      let i = item.dayOfWeek + 1
      while (i < 7) {
        let thisDay = moment(item.date).clone().day(i)
        prev[item.week].push({
          dayOfMonth: thisDay.date(),
          date: thisDay.toDate(),
          dateISO: thisDay.toISOString(),
          dayOfWeek: thisDay.weekday(),
          week: thisDay.week(),
          isCurrentMonth: false
        })
        i++
      }
    }


    return prev as calendarViewData
  }, {})


}

const Calendar = (props: CalendarProps) => {

  const { records, totals, month } = useContext(RecordsContext)
  const [view, setView] = useState([])

  useEffect(() => {
    let data = generateCalendarArray(month.toDate())

    let dataArray = Object.keys(data).map(e => {
      return data[e].map((day :calendarViewData) => {
        let dayData = records.find(d => d.day == day.dayOfMonth)
        if (!dayData) {
            day.hasRecord = false
            day.totals = { income: 0, expense: 0, total: 0 }
          return day  
        }
        day.hasRecord = dayData.items.length > 0
          let  { income,expenses } = dayData 
        day.totals = {income, expense:expenses, total: income-expenses}
        return day
      })
    })

    setView(dataArray);


  },[records])

  
  return <Box>
    <Paper sx={{ p: 1, my: 1 }}>
      <Grid container columns={7} sx={{textAlign:'center', padding:1} }>
        <Grid item xs={1} padding={ 1} >Sun</Grid>
        <Grid item xs={1} padding={1} >Mon</Grid>
        <Grid item xs={1} padding={1} >Tue</Grid>
        <Grid item xs={1} padding={1} >Wed</Grid>
        <Grid item xs={1} padding={1} >Thu</Grid>
        <Grid item xs={1} padding={1} >Fri</Grid>
        <Grid item xs={1} padding={1} >Sat</Grid>
      </Grid>
      {
        view.map(week=><Grid container columns={7} sx={{ padding: 1 }}>
          {
            week.map(day => <Grid item xs={1} >
              <Box>
                {day.dayOfMonth }
              </Box>
              {!day.isCurrentMonth ? <Box>
                Test
              </Box> : <>
                  <Box>{day.income}</Box>
                  <Box>{day.expense}</Box>
                  <Box>{day.total}</Box>
              </>}
            </Grid>)
          }
        </Grid>)
      }

      <Grid container columns={7} columnGap={3}>
        <Grid item xs={1} >
          <Box></Box>
        </Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
        <Grid item xs={1} >1</Grid>
      </Grid>
    </Paper>


  </Box>
}

export default Calendar