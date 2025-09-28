import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../App";
import api from "../components/api";
import { ScheduledTransactions } from "FinanceApi";
import fnApi from "../components/fnApi";

const SCHEDULED_TRANSACTION = "scheduledTransactions";

export const getAllSchedules = () => {
  api.get("scheduledtransactions").then((res) =>
    res.data.map((e) => {
      queryClient.setQueryData([SCHEDULED_TRANSACTION, { id: e.id }], e);
    }),
  );
};

export const getOne = (id: string) => {
  api.get("scheduledtransactions").then((res) => res.data);
};

export const useMutateSchedule = () => {
  const create = useMutation({
    mutationFn: (data: ScheduledTransactions) => {
      return fnApi.post("scheduledtransactions", data).then((res) => res.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([SCHEDULED_TRANSACTION, { id: data.id }], data);
    },
  });

  const update = useMutation({
    mutationFn: (data: ScheduledTransactions) => {
      return fnApi.post("scheduledtransactions", data).then((res) => res.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([SCHEDULED_TRANSACTION, { id: data.id }], data);
    },
  });

  return { create: create.mutateAsync, update: update.mutateAsync };
};
