import { useContext, createContext, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "./LocalDb";
export const defaultData = {
  accountTypes: [],
  accountGroups: [],
  accounts: [],
  vendors: [],
  set: () => {},
};

export const DropdownContext = createContext(defaultData);

export default () => {
  const data = useContext(DropdownContext);

  const accountTypes =
    useLiveQuery(async () => await db.accountTypes.toArray()) || [];
  const accountGroups =
    useLiveQuery(async () => await db.accountGroups.toArray()) || [];
  const accounts = useLiveQuery(async () => await db.accounts.toArray()) || [];
  const vendors = useLiveQuery(async () => await db.vendors.toArray()) || [];

  return { ...data, accountTypes, accountGroups, accounts, vendors };
};
