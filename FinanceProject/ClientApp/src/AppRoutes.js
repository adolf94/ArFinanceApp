import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import AccountsPage from "./Pages/AccountsPage";
import NewRecordPage from "./Pages/NewRecord";
import Records from "./Pages/Records";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: '/counter',
    element: <Counter />
  },
  {
    path: "/records",
    element: <Records />
  },
  {
    path: "/records/new",
    element: <NewRecordPage />
  },
  {
    path: "/accounts",
    element: <AccountsPage />
  },
  {
    path: '/fetch-data',
    element: <FetchData />
  }
];

export default AppRoutes;
