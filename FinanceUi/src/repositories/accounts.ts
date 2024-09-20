import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Account } from "FinanceApi";
import api from "../components/api";
import { queryClient } from "../App";
import replaceById from "../common/replaceById";

export const ACCOUNT = "account";

export const fetchAccounts = () => {
  return api.get("accounts").then((res) => {
    res.data.forEach((acct) => {
      queryClient.setQueryData([ACCOUNT, { id: acct.id }], acct);
    });
      let last = localStorage.getItem("last_transaction");
      if(!last) localStorage.setItem("last_transaction", res.headers["x-last-trans"])
    return res.data;
  });
};

export const fetchByAccountId = async (id: string) => {

  //[ACCOUNT, { id: acct.id }]

    let accountCache = await queryClient.getQueryData<Account[]>([ACCOUNT])
    if (!accountCache) accountCache = await queryClient.ensureQueryData<Account[]>({
        queryKey: [ACCOUNT], queryFn: fetchAccounts
    })
    let account = accountCache.find(e=>e.id === id)

    if(!!account) return account

    return api.get("accounts/" + id).then((e) => {
        queryClient.setQueryData([ACCOUNT] , replaceById(account,accountCache))
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
