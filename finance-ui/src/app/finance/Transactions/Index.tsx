import React, { useEffect } from 'react';
import TopNav from './TopNav';
import { Box, Fab, Grid, Tab, Tabs } from '@mui/material';
import useHeaderContext from '../common/headerContext';
import { Route, Routes, useMatch, useNavigate, useParams } from 'react-router';
import moment from 'moment';
import DailyView from './DailyView';
import { Add as IcoAdd } from '@mui/icons-material';



const fabStyle = {
  position: 'absolute',
  bottom: 76,
  right: 16,
};


function TransactionsPage() {
  const ctx = useHeaderContext()
  const navigate = useNavigate()
  const { section, month } = useParams()

  const navigateView = (view: string) => {
    navigate("../" + month  + "/" + view)
  }
  return (
    <Box>
      <TopNav />
      
      <Tabs sx={{ mt: ctx.height + 'px' }} value={section} onChange={(evt, value: string) => { navigateView(value) }}>
        <Tab label="Daily" value="daily" ></Tab>
        <Tab label="Calendar" value="calendar" ></Tab>
        <Tab label="Total" value="total"></Tab>
        <Tab label="Notes" value="notes"></Tab>
      </Tabs>
      <Routes>
        <Route path="daily" element={<DailyView />}></Route>
        <Route path="calendar"></Route>
        <Route path="total"></Route>
        <Route path="notes"></Route>
      </Routes>
      <Fab sx={fabStyle} color="success" onClick={()=>navigate("../new")}>
        <IcoAdd />
      </Fab>
    </Box>  );
}

export default TransactionsPage;