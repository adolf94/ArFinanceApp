import { useMutation, useQueryClient } from "react-query"
import api from "./api"
import { Account, AccountGroup } from 'FinanceProject'

export async function getById(id: string): Promise<AccountGroup> {
    const res = await api.get(`/accountgroups/${id}`)
    return res.data
}

export const getAll = () : Promise<AccountGroup[]>=> {
  return api("/accountgroups")
    .then(res => {
      return res.data
    })
}

export const getByType = (typeid: string): Promise<AccountGroup[]> => {
  return api(`/accounttypes/${typeid}/accountgroups`)
    .then(res => {
      return res.data
    })
}
export const useMutateAccountGroup = () => {
  const queryClient = useQueryClient()
  const create =useMutation({
    mutationFn: (accountGroup: Partial<AccountGroup>) => api.post("/accountgroups", accountGroup).then(res=>res.data),
    onSuccess: (data: AccountGroup) => {
      queryClient.setQueryData(["accountGroup", { accountGroupId: data.accountTypeId }], data)
      queryClient.invalidateQueries(["accountGroup"])
    }
  })


  return {create: create.mutateAsync}
}