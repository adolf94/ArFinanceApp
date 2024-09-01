import React from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Finance from './finance/Index';
import { LocalizationProvider} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { QueryClient, QueryClientProvider } from 'react-query';


const queryClient = new QueryClient()

function MainRouter() {
  return (
    <QueryClientProvider client={queryClient} >
    <LocalizationProvider dateAdapter={ AdapterMoment }>
    <Router>
      <Routes>
        <Route path="/finance/*" element={<Finance />} />
        <Route path="/" element={<h1>Home</h1>} />
      </Routes>
      </Router>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default MainRouter;