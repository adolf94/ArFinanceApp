import api from "../components/api"

export const ACCOUNT_BALANCE = "accountBalance"

export const getBalancesByDate = (date: string, acctId? : string) => {

  return acctId ? api("account/" + acctId + "/accountbalance/" + date)
    .then(e => e.data) :
    api("accountbalance/" + date)
    .then(e=>e.data)

}

