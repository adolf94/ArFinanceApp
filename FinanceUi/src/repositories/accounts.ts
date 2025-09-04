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
import { e } from "mathjs";

export const ACCOUNT = "account";


export const fetchAccounts = () => {


  return fnApi.get("accounts").then(async (res) => {
      let newData = localPutAccount(res.data)
      let last = localStorage.getItem("last_transaction");
      if(!last) localStorage.setItem("last_transaction", res.headers["x-last-trans"])
    return newData;
  });
};

// fetchByAcctId => fetchAccounts => localPutAcct
// fetchByAcctId => localPutAcct
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

      var ensuredAccount = await localPutAccount(e.data)

        queryClient.setQueryData([ACCOUNT] , replaceById(ensuredAccount,accountCache))
        return ensuredAccount;
      });
};

//useMutate => onSuccess => localPutAcct
export const useMutateAccount = () => {

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
      localPutAccount(data)
    },
  });

    return { createAsync: create.mutateAsync, createExt:create };
};


export const localPutAccount = async (account: Account | Account[]) => {
  var groups = await queryClient.ensureQueryData<AccountGroup[]>({
    queryKey: [ACCOUNT_GROUP], queryFn: fetchGroups
  })

  const getGroup = (id)=>groups.find(g=>g.id == id)
  let toPut
  if(Array.isArray(account)){
    toPut = account.map(e=>({...e, type:getGroup(e.accountGroupId).accountTypeId, dateUpdated: moment().toDate()}))
    toPut.forEach(acct=>{
      queryClient.setQueryData([ACCOUNT, { id: toPut.id }], acct);
    })
    db.accounts.bulkPut(toPut)
  }else{
    toPut = {...account, type:getGroup(account.accountGroupId).accountTypeId, dateUpdated: moment().toDate()}
    queryClient.setQueryData([ACCOUNT, { id: toPut.id }], toPut);
    queryClient.setQueryData([ACCOUNT] , (prev : Account[])=>replaceById(toPut,prev))
    db.accounts.put(toPut)
  }
  return toPut
}

