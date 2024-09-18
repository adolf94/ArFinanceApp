import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Account } from "FinanceApi";
import api from "../components/api";
import { queryClient } from "../App";

export const ACCOUNT = "account";

export const fetchAccounts = () => {
  return api.get("accounts").then((e) => {
    e.data.forEach((acct) => {
      queryClient.setQueryData([ACCOUNT, { id: acct.id }], acct);
    });
    return e.data;
  });
};

export const fetchByAccountId = async (id: string) => {

  //[ACCOUNT, { id: acct.id }]
  return api.get("accounts/" + id).then((e) => {
    return e.data;
  });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: Partial<Account>) => {
      return api
        .post("accounts", {
          accountGroupId: data.accountGroupId,
          resetEndOfPeriod: data.resetEndOfPeriod,
          balance: data.balance,
          periodStartDay: data.periodStartDay,
          name: data.name,
          enabled: true,
        })
        .then((e) => e.data);
    },
    onSuccess: (data: Account) => {
      queryClient.setQueryData([ACCOUNT, { id: data.id }], data);
      queryClient.setQueryData([ACCOUNT], (prev: Account[]) => [
        ...(prev || []),
        data,
      ]);
    },
  });

    return { createAsync: create.mutateAsync, createExt:create };
};
