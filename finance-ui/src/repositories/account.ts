import { Account } from "FinanceProject"
import api from "./api"
import { useMutation } from "react-query"


export const getByGroup = (id: string): Promise<Account[]> => {

  return api(`/accountgroups/${id}/accounts`)
    .then(e=>e.data)
}

export const useMutateAccount = () => {

  const create = useMutation({
    mutationFn: (data: Partial<Account>) => api.post("/accounts", data)
      .then(e=>e.data)
  })

  return {create}
}