import {
  IndexRouteProps,
  LayoutRouteProps,
  PathRouteProps,
} from "react-router";
import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import React from "react";
import AccountsPage from "./Pages/AccountsPage";
import NewRecordPage from "./Pages/NewRecord";
import Records from "./Pages/Records";
import ViewAccount from "./Pages/Accounts/ViewAccount";
import Settings from "./Pages/Settings";

const AppRoutes: (PathRouteProps | IndexRouteProps | LayoutRouteProps)[] = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/records/:view",
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
];

export default AppRoutes;
