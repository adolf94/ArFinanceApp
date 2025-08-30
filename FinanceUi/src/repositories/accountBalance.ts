import { AxiosResponse } from "axios";
import fnApi from "../components/fnApi";
import { queryClient } from "../App";
import { AccountBalance } from "FinanceApi";
import moment from "moment";
import db from "../components/LocalDb";
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


export const getAcctBalWithDateRange = (id, from, to)=>{
  return fnApi("accountBalance", {
    params:{
      accountId: id,
      from: from,
      to: to
    }
  }).then((e) => {
    e.data.forEach((bal : AccountBalance) => {
      queryClient.setQueryData([
            ACCOUNT_BALANCE,
            { accountId: id, date: moment(bal.dateStart).format("yyyy-MM-01") }]
          , bal);
      
    });
    db.accountBalances.bulkPut(e.data);
    return e.data
  })
}
