import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { Account } from "FinanceApi"
import api from "../components/api"

export const ACCOUNT = "account"

export const fetchAccounts = () => {

  return api.get("accounts")
    .then(e=>e.data)

}

export const useMutateAccount = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
      mutationFn: (data: Partial<Account>) => {
        return api.post("accounts", {
          accountGroupId: data.accountGroupId,
          balance: data.balance,
          name: data.name,
          enabled:true
        })
        .then(e=>e.data)
      },
      onSuccess: (data:Account) => {
        queryClient.setQueryData([ACCOUNT, { id: data.id }], data)
        queryClient.setQueryData([ACCOUNT], (prev : Account[])=>([...(prev || []), data]))
      }
    })  

  return {createAsync: create.mutateAsync}
}