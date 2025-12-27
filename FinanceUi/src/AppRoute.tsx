import {
  IndexRouteProps,
  LayoutRouteProps,
  PathRouteProps,
} from "react-router";
import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import Loader from "./components/Loader";
import ImageGallery from "./Pages/Gallery/ImageGallery";
import SecuritySettings from "./Pages/Settings/Security";
import NewBatchRecords from "./Pages/NewBatchRecords";

const AccountsPage = lazy(() => import("./Pages/AccountsPage.tsx"));
const HooksSettings = lazy(() => import("./Pages/Settings/Hooks.tsx"));
const NewRecordPage = lazy(() => import("./Pages/NewRecord.tsx"));
const Notifications = lazy(() => import("./Pages/Notifications.js"));
const Records = lazy(() => import("./Pages/Records.tsx"));
const Settings = lazy(() => import("./Pages/Settings.tsx"));
const ViewAccount = lazy(() => import("./Pages/Accounts/ViewAccount.tsx"));

const AppRoutes: (PathRouteProps | IndexRouteProps | LayoutRouteProps)[] = [
  {
    index: true,
    element: <Navigate to="/records" />,
  },
  {
    path: "/records/:monthStr/:view",
    element: (
      <Suspense fallback={<Loader />}>
        <Records />
      </Suspense>
    ),
  },
  {
    path: "/records",
    element: (
      <Suspense fallback={<Loader />}>
        <Records />
      </Suspense>
    ),
  },
  {
    path:"/audits/new",
    element: <Suspense fallback={<Loader />}>
      <NewBatchRecords />
    </Suspense>
  },
  {
    path: "/transactions/:transId",

    element: (
      <Suspense fallback={<Loader />}>
        <NewRecordPage />
      </Suspense>
    ),
  },
  {
    path: "/accounts/:acctId",
    element: (
      <Suspense fallback={<Loader />}>
        <ViewAccount />
      </Suspense>
    ),
  },
  {
    path: "/accounts",
    element: (
      <Suspense fallback={<Loader />}>
        <AccountsPage />
      </Suspense>
    ),
  },
  {
    path: "/images",
    element: (
      <Suspense fallback={<Loader />}>
        <ImageGallery />
      </Suspense>
    ),
  },
  {
    path: "/settings",
    element: (
      <Suspense fallback={<Loader />}>
        <Settings />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Settings />
      </Suspense>
    ),
  },
  {
    path: "/settings/hooks",
    element: (
      <Suspense fallback={<Loader />}>
        <HooksSettings />
      </Suspense>
    ),
  },
  {
    path: "/settings/security",
    element: (
      <Suspense fallback={<Loader />}>
        <SecuritySettings />
      </Suspense>
    ),
  },
  {
    path: "/notifications",
    element: (
      <Suspense fallback={<Loader />}>
        <Notifications />
      </Suspense>
    ),
  },
];

export default AppRoutes;
