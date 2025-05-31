import api from "../components/api";
import { AxiosResponse } from "axios";
import fnApi from "../components/fnApi";
export const ACCOUNT_BALANCE = "accountBalance";

export const getBalancesByDate = (date: string, acctId?: string) => {
  return acctId
    ? fnApi("account/" + acctId + "/accountbalance/" + date).then((e) => e.data)
    : fnApi("accountbalance/" + date)
        .then((e) => e.data) 
        .catch((e) => {
          if ((e.response as AxiosResponse).status === 404) return null;
        });
};
