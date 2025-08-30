import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Account, AccountGroup } from "FinanceApi";
import { queryClient } from "../App";
import replaceById from "../common/replaceById";
import db from "../components/LocalDb";
import moment from "moment";
import fnApi from "../components/fnApi";
import { ACCOUNT_GROUP, fetchGroups } from "./accountgroups";

export const ACCOUNT = "account";


export const fetchAccounts = () => {


  return fnApi.get("accounts").then(async (res) => {

    var groups = await queryClient.ensureQueryData<AccountGroup[]>({
        queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups
    })



    res.data.forEach((acct) => {
      var group = groups.find(e=>e.id == acct.accountGroupId)

      acct.type = group.accountTypeId

      queryClient.setQueryData([ACCOUNT, { id: acct.id }], acct);
      db.accounts.put({...acct, type: group.accountTypeId, dateUpdated: moment().toDate()})
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

    return fnApi.get("accounts/" + id).then(async (e) => {


      var groups = await queryClient.ensureQueryData<AccountGroup[]>({
          queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups
      })

      var group = groups.find(g=>g.id == e.data.accountGroupId)
      e.data.type = group.accountTypeId

        queryClient.setQueryData([ACCOUNT] , replaceById(e.data,accountCache))
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
      db.accounts.put({...data, dateUpdated: moment().toDate()})
      queryClient.setQueryData([ACCOUNT, { id: data.id }], data);
      queryClient.setQueryData([ACCOUNT], (prev: Account[]) => [
        ...(prev || []),
        data,
      ]);
    },
  });

    return { createAsync: create.mutateAsync, createExt:create };
};
