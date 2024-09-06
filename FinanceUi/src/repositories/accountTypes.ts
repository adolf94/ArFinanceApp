import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../components/api";
import { AccountType } from "FinanceApi";

export const ACCOUNT_TYPE = "accountTypes";

export const fetchTypes = () => {
  return api.get("/accountTypes").then((e) => e.data);
};

export const useMutateType = () => {
  const queryClient = useQueryClient();

  const create = useMutation<AccountType>({
    mutationFn: (data) => {
      return api.post<AccountType>("/accountTypes", data).then((e) => e.data);
    },
    onSuccess: (data) =>
      queryClient.setQueryData([ACCOUNT_TYPE, { id: data.id }], data),
  });

  return { create: create.mutate };
};
