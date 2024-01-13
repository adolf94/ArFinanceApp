import React, { useEffect, useState } from 'react';
import BottomNav from './BottomNav';
import TopNav from './Transactions/TopNav';
import { Outlet, Route, Routes, useMatch, useNavigate, useParams } from 'react-router-dom';
import Accounts from './Accounts/Index';
import Transactions from './Transactions/Index';
import { Box } from '@mui/material';
import { HeaderContext, HeaderContextDefaultValue } from './common/headerContext';
import Expenses from './Cashflows/Expenses/Index';
import Income from './Cashflows/Income/Index';
import NewAcct from './Accounts/NewAcct';
import NewGroup from './Accounts/NewGroup';
import NewTransaction from './Transactions/NewTransaction';
import moment from 'moment';

const EmptyRoute = () => {
  const match = useMatch("finance/transactions/:month/:section/*")
  const navigate = useNavigate()
  useEffect(() => {
    if(match?.params.month == "new") return
    if (!match?.params.month) {
      navigate(moment().format("YYYY-MM") + "/daily")
    } else if (!match?.params.section) {
      navigate(match?.params.month + "/daily")
    }
  }, [match])

  return <>
    <Outlet />
  </>
}

function Finance() {
  const [headerContext, setHeaderContext] = useState(HeaderContextDefaultValue)
  console.debug(useParams())
  return (
    <HeaderContext.Provider value={{ ...headerContext, set: setHeaderContext }}> 
      <Box>
        <Routes>
          <Route path="transactions/*"> 
            <Route path="new" element={ <NewTransaction /> } />
            <Route path=":month/*" element={<Transactions />} />
            <Route index element={<EmptyRoute />} />

          </Route>
          <Route path="accounts/*" >
            <Route path="new/:typeid" element={ <NewAcct />}></Route>
            <Route path="newgroup/:typeid" element={<NewGroup />}></Route>
            <Route index element={<Accounts />} />
          </Route>
          <Route path="settings/expenses/*" element={<Expenses />}></Route>
          <Route path="settings/expenses/*" element={<Expenses />}></Route>
          <Route path="settings/income/*" element={<Income />}></Route>
        </Routes>
      </Box>
      <BottomNav></BottomNav>
    </HeaderContext.Provider>
  );
}

export default Finance;