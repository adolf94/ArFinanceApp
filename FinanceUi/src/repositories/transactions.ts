import { useMutation } from "@tanstack/react-query";
import api from "../components/api";
import {
  Account,
  CreateTransactionDto,
  NewTransactionResponseDto,
  Transaction,
  Vendor,
} from "FinanceApi";
import { queryClient } from "../App";
import moment from "moment";
import { VENDOR, fetchVendorById } from "./vendors";
import { ACCOUNT, fetchAccounts, fetchByAccountId } from "./accounts";
import { AxiosResponse } from "axios";
import replaceById from "../common/replaceById";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

export const TRANSACTION = "transaction";

const addToTransactions = (item: Transaction, replace: boolean) => {
  const { debit, credit } = item;
  const key = {
    year: moment(item.date).get("year"),
    month: moment(item.date).get("month") + 1,
  };


    let mData = queryClient.getQueryData<Transaction[]>([TRANSACTION, key])
    if (mData) {

        queryClient.setQueryData([TRANSACTION, key], (prev: Transaction[]) => {
            return replaceById(item, dData);
        });
    }



  let dKey = {
    accountId: credit.id,
    year: moment(item.date).add(-debit.periodStartDay + 1, "day").year(),
    month: moment(item.date).add(-debit.periodStartDay + 1, "day").month() + 1,
  };


    let dData = queryClient.getQueryData<Transaction[]>([TRANSACTION, dKey])
    if (dData) {

        queryClient.setQueryData([TRANSACTION, dKey], (prev: Transaction[]) => {
            return replaceById(item, dData);
        });
    }

  let cKey = {
    accountId: credit.id,
    year: moment(item.date).add(-credit.periodStartDay + 1, "day").year(),
    month: moment(item.date).add(-credit.periodStartDay + 1, "day").month() + 1,
    };

    let cData = queryClient.getQueryData<Transaction[]>([TRANSACTION, cKey])
    if (cData) {

        queryClient.setQueryData([TRANSACTION, cKey], (prev: Transaction[]) => {
            return replaceById(item, cData);
        });
    }

};

export const fetchTransactionsByMonth = (year: number, month: number) => {
  console.debug("fetchTransactionsByMonth", { year, month });

  return api<Transaction[]>("transactions", { params: { year, month } }).then(
    (e) => {
      return Promise.all(
        e.data.map(async (item) => {
          item.vendor =
            item.vendorId &&
            (await queryClient.ensureQueryData({
              queryKey: [VENDOR, { id: item.vendorId }],
              queryFn: () => fetchVendorById(item.vendorId),
            }));
          item.debit = await queryClient.ensureQueryData({
            queryKey: [ACCOUNT, { id: item.debitId }],
            queryFn: () => fetchByAccountId(item.debitId),
          });
          item.credit = await queryClient.ensureQueryData({
            queryKey: [ACCOUNT, { id: item.creditId }],
            queryFn: () => fetchByAccountId(item.creditId),
          });

          queryClient.setQueryData([TRANSACTION, { id: item.id }], item);
          return item;
        }),
      ).then(async (records) => {
        let nextPeriodMonth = moment({ year, month: month, day: 1 }).add(
          1,
          "month",
        );
        let accounts = await queryClient.ensureQueryData<Account[]>({
          queryKey: [ACCOUNT],
          queryFn: () => fetchAccounts(),
        });
        let nextMonth = await queryClient.getQueryData([
          TRANSACTION,
          { year: nextPeriodMonth.year(), month: nextPeriodMonth.month() + 1 },
        ]);

        accounts.forEach((account) => {
          if (!nextMonth || account.periodStartDay !== 1) return;
          const from = moment({
            year,
            month: month,
            day: account.periodStartDay,
          });

          queryClient.setQueryData(
            [TRANSACTION, { accountId: account.id, month, year }],
            records.filter(
              (e) =>
                (e.creditId === account.id || e.debitId === account.id) &&
                moment(e.date).isAfter(from) &&
                moment(e.date).isBefore(nextPeriodMonth),
            ),
          );
        });

        return records;
      });
    },
  );
};

export const fetchByAcctMonth = (
  acctId: string,
  year: number,
  month: number,
) => {
  console.debug("fetchByAcctMonth", { acctId, year, month });
  let dateCurrent = moment();
  let dateNextMonth = moment();
  return queryClient
    .ensureQueryData({
      queryKey: [ACCOUNT, { id: acctId }],
      queryFn: () => fetchByAccountId(acctId),
      networkMode: "always",
    })
    .then((acct) => {
      dateCurrent = moment([year, month - 1, acct.periodStartDay]);
      dateNextMonth = dateCurrent.clone().add(1, "month");
      console.debug("dateCurrent", dateCurrent.toISOString());
      return Promise.all([
        queryClient.ensureQueryData({
          queryKey: [TRANSACTION, { year, month }],
          queryFn: () => fetchTransactionsByMonth(year, month),
        }),
        acct.periodLastDate === 1
          ? []
          : queryClient.ensureQueryData({
              queryKey: [
                TRANSACTION,
                {
                  year: dateNextMonth.year(),
                  month: dateNextMonth.month() + 1,
                },
              ],
              queryFn: () =>
                fetchTransactionsByMonth(
                  dateNextMonth.year(),
                  dateNextMonth.month() + 1,
                ),
            }),
      ]);
    })
    .then((result) => {
      return [...result[0], ...result[1]].filter((tr) => {
        return (
          moment(tr.date).isBetween(dateCurrent, dateNextMonth) &&
          [tr.creditId, tr.debitId].includes(acctId)
        );
      });
    });
};

//return api<Transaction[]>(`/accounts/${acctId}/transactions`, { params: { year, month } })
//  .then(e => {
//    return Promise.all(e.data.map(async item => {

//      item.vendor = item.vendorId && await queryClient.ensureQueryData({ queryKey: [VENDOR, { id: item.vendorId }], queryFn: () => fetchVendorById(item.vendorId) })
//      item.debit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.debitId }], queryFn: () => fetchByAccountId(item.debitId) })
//      item.credit = await queryClient.ensureQueryData({ queryKey: [ACCOUNT, { id: item.creditId }], queryFn: () => fetchByAccountId(item.creditId) })

//      queryClient.setQueryData([TRANSACTION, { id: item.id }], item)
//      return item
//    })
//    )
//  })

export const fetchTransactionById = (transId) => {
  return api<Transaction>("transactions/" + transId).then(async (e) => {
    let item = e.data;

    item.vendor =
      item.vendorId &&
      (await queryClient.ensureQueryData({
        queryKey: [VENDOR, { id: item.vendorId }],
        queryFn: () => fetchVendorById(item.vendorId),
      }));
    item.debit = await queryClient.ensureQueryData({
      queryKey: [ACCOUNT, { id: item.debitId }],
      queryFn: () => fetchByAccountId(item.debitId),
    });
    item.credit = await queryClient.ensureQueryData({
      queryKey: [ACCOUNT, { id: item.creditId }],
      queryFn: () => fetchByAccountId(item.creditId),
    });

    return item;
  });
};

export const useMutateTransaction = () => {
const navigate = useNavigate()
  const create = useMutation({
      mutationFn: (data: Partial<Transaction>) => {
      navigate(`../records/${moment(data.date).format("YYYY-MM")}/daily`);
          return api
            .post<NewTransactionResponseDto>("transactions", data)
            .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
              let item  = e.data.transaction;

              item.vendor =
                item.vendorId ?
                (await queryClient.ensureQueryData<Vendor>({
                  queryKey: [VENDOR, { id: item!.vendorId }],
                  queryFn: () => fetchVendorById(item!.vendorId!),
                })) : null;

                let accounts = e.data.accounts;
                accounts.forEach(e => {
                    queryClient.setQueryData([ACCOUNT, { id: e.id }], e);
                })


                item.credit = queryClient.getQueryData([ACCOUNT, { id: item.creditId}])
                item.debit = queryClient.getQueryData([ACCOUNT, { id: item.debitId }])


              queryClient.setQueryData([TRANSACTION, { id: item.id }], item);


              queryClient.setQueryData([ACCOUNT], (prev) => {
                if (!prev || !Array.isArray(prev)) return undefined;
                return replaceById(e.data.accounts, prev);
              });

              return item;
            });
    },
    onSuccess: async (item: Transaction) => {
     enqueueSnackbar("Saved!", {variant : 'info'})  
      addToTransactions(item, false);
    },
  });

  const update = useMutation({
    mutationFn: (data: Partial<Transaction>) => {
      navigate(`../records/${moment(data.date).format("YYYY-MM")}/daily`);
          return api
        .put<NewTransactionResponseDto>("transactions/" + data.id, data)
        .then(async (e: AxiosResponse<NewTransactionResponseDto>) => {
          let item = e.data.transaction;

          item.vendor =
            item.vendorId &&
            (await queryClient.ensureQueryData({
              queryKey: [VENDOR, { id: item.vendorId }],
              queryFn: () => fetchVendorById(item.vendorId),
            }));
          item.debit = await queryClient.ensureQueryData({
            queryKey: [ACCOUNT, { id: item.debitId }],
            queryFn: () => fetchByAccountId(item.debitId),
          });
          item.credit = await queryClient.ensureQueryData({
            queryKey: [ACCOUNT, { id: item.creditId }],
            queryFn: () => fetchByAccountId(item.creditId),
          });

          const oldItem = await queryClient.getQueryData<Transaction>([
            TRANSACTION,
            { id: item.id },
          ]);
          if (!!oldItem) {
            let key = {
              year: moment(item.date).get("year"),
              month: moment(item.date).get("month") + 1,
            };

            queryClient.setQueryData(
              [TRANSACTION, key],
              (prev: Transaction[]) => {
                if (!prev || !Array.isArray(prev)) return undefined;
                let index = prev.findIndex((e) => e.id == oldItem.id);
                if (index > -1) prev.splice(index, 1);
                return prev;
              },
            );
          }

          queryClient.setQueryData([TRANSACTION, { id: item.id }], item);
          e.data.accounts.forEach((account) => {
            queryClient.setQueryData([ACCOUNT, { id: account.id }], account);
          });

          queryClient.setQueryData([ACCOUNT], (prev) => {
            if (!prev || !Array.isArray(prev)) return undefined;
            return replaceById(e.data.accounts, prev);
          });


          return item;
        })
    },
    onSuccess: (item) => {
        enqueueSnackbar("Saved!", { variant: 'info' })
        addToTransactions(item, true);

    }
  });

  return { create: create.mutateAsync, createExt : create, update: update.mutateAsync, updateExt:update };
};
