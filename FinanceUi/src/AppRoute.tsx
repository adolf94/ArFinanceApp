import {
  IndexRouteProps,
  LayoutRouteProps,
  PathRouteProps,
} from "react-router";
import { Home } from "./components/Home";
import React from "react";
import AccountsPage from "./Pages/AccountsPage";
import NewRecordPage from "./Pages/NewRecord";
import Records from "./Pages/Records";
import ViewAccount from "./Pages/Accounts/ViewAccount";
import Settings from "./Pages/Settings";
import { Navigate } from "react-router-dom";
import Notifications from "./Pages/Notifications.js";

const AppRoutes: (PathRouteProps | IndexRouteProps | LayoutRouteProps)[] = [
  {
    index: true,
    element: <Navigate to="/records" />,
  },
  {
    path: "/records/:monthStr/:view",
    element: <Records />,
  },
  {
    path: "/records",
    element: <Records />,
  },
  {
    path: "/transactions/:transId",
    
    element: <NewRecordPage />,
  },
  {
    path: "/accounts/:acctId",
    element: <ViewAccount />,
  },
  {
    path: "/accounts",
    element: <AccountsPage />,
  },
  {
    path: "/settings",
      element: <Settings />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
];

export default AppRoutes;
