import api from "../components/api"
import { AxiosResponse } from 'axios'
export const ACCOUNT_BALANCE = "accountBalance"

export const getBalancesByDate = (date: string, acctId?: string) => {

    return acctId ? api("account/" + acctId + "/accountbalance/" + date)
        .then(e => e.data) :
        api("accountbalance/" + date)
            .then(e => e.data)
            .catch(e => {
                if ((e.response as AxiosResponse).status === 404) return null;

            });

}

