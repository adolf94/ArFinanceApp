import { AccountType } from "FinanceProject"
import api from "./api"




export const getById = (id: string) : Promise<AccountType> => {

  return api(`/accounttypes/${id}`)
    .then(res=>res.data)
}
