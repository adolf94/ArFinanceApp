﻿import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../components/api";
import { AccountGroup } from "FinanceApi";
import { queryClient } from "../App";

export const ACCOUNT_GROUP = "accountGroup";

export const fetchGroups = () => {
  return api.get("/accountgroups").then((e) => e.data);
};

export const fetchGroupById = (id: string) => {
  let state = queryClient.getQueryState([ACCOUNT_GROUP]);
  console.log(state);
  return api.get("/accountgroups").then((e) => e.data);
};

export const useMutateGroups = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: Partial<AccountGroup>): Promise<AccountGroup> => {
      return api.post("accountgroups", data).then((e) => e.data);
    },
    onSuccess: (data: AccountGroup) => {
      queryClient.setQueryData([ACCOUNT_GROUP, { id: data.id }], data);
      queryClient.setQueryData([ACCOUNT_GROUP], (prev : AccountGroup[]) => [...prev, data]);
    },
  });

  return { createAsync: create.mutateAsync, createExt:create };
};
