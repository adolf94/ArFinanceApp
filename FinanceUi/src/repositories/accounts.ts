import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Account } from "FinanceApi";
import api from "../components/api";
import { queryClient } from "../App";
import replaceById from "../common/replaceById";
import db from "../components/LocalDb";
import moment from "moment";
import fnApi from "../components/fnApi";

export const ACCOUNT = "account";






export const fetchAccounts = () => {
  return fnApi.get("accounts").then((res) => {
    res.data.forEach((acct) => {
      queryClient.setQueryData([ACCOUNT, { id: acct.id }], acct);
      db.accounts.put({...acct, dateUpdated: moment().toDate()})
    });
      let last = localStorage.getItem("last_transaction");
      if(!last) localStorage.setItem("last_transaction", res.headers["x-last-trans"])
    return res.data;
  });
};

export const fetchByAccountId = async (id: string, force: boolean = false) => {

    //[ACCOUNT, { id: acct.id }]
    let account = null
    let accountCache = await queryClient.getQueryData<Account[]>([ACCOUNT])
    if (!force) {
        if (!accountCache) accountCache = await queryClient.ensureQueryData<Account[]>({
            queryKey: [ACCOUNT], queryFn: fetchAccounts
        })
        account = accountCache.find(e => e.id === id)
    }

    if(!!account) return account

    return fnApi.get("accounts/" + id).then((e) => {
        queryClient.setQueryData([ACCOUNT] , replaceById(account,accountCache))
        return e.data;
      });
};

export const useMutateAccount = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: Partial<Account>) => {
      return fnApi
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
