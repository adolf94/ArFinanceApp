import React, {
  useState,
  useContext,
  SetStateAction,
  useEffect,
} from "react";
import {
  List,
  Grid,
  Button,
  TextField,
  ListItem,
  FormLabel,
  Portal,
  Autocomplete,
  Box,
  createFilterOptions,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { SelectAccountContext } from "../NewRecord";
//import { makeStyles } from '@mui/styles'
import { DateTimePicker } from "@mui/x-date-pickers";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import SelectAccount from "./SelectAccount";
import { useQuery } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { Calculate, Repeat as IcoRepeat } from "@mui/icons-material";
import { ScheduledTransactions, Transaction } from "FinanceApi";
import { useMutateTransaction } from "../../repositories/transactions";
import NumberInput from "../../common/NumberInput";
import DropdownSelect from "../../common/Select";
import cron from "cron-parser";
import { useMutateSchedule } from "../../repositories/scheduledTasks";
import VendorTextField from "./VendorTextField";


const cronOptions = [
  { name: "Monthly", cron: "0 0 DD * *" },
  { name: "Twice a month 15/30", cron: "0 0 15,[L] * *" },
];

interface NewRecordFormProps {
  formData: Partial<Transaction>;
  setFormData: React.Dispatch<Omit<SetStateAction<Transaction>, "id">>;
  selectPortal: Element;
}

const NewRecordForm = (props: NewRecordFormProps) => {
  const { formData, setFormData } = props;
  const view = useContext<any>(SelectAccountContext);
  const mutateTransaction = useMutateTransaction();
  const mutateSchedule = useMutateSchedule();
    const navigate = useNavigate();
  const { transId } = useParams();
  const type = props.formData.type;
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("lg"));
  const [iteration, setIteration] = useState(12);
  const [selectedIteration, setSelectedIteration] = useState<any>();

  const [schedule, setSchedule] = useState<ScheduledTransactions>({
    enabled: false,
    cronId: "",
    cronExpression: "",
    endDate: "",
    dateCreated: moment().toISOString(),
    id: uuid(),
    lastTransactionDate: moment().toISOString(),
  });

  const isSubmittable = () => {
    const { creditId, debitId, vendorId } = formData;
    if (!(creditId && debitId && vendorId)) return false;
    if (schedule.enabled) {
      const { cronExpression, endDate } = schedule;
      if (!(cronExpression && endDate)) return false;
    }
    return true;
    };


  const setType = (type) => {
    switch (formData.type) {
      case "income":
        if (type === "expense")
          setFormData({
            ...formData,
            type,
            credit: formData.debit,
            creditId: formData.debit?.id,
            debit: null,
            debitId: null,
          });
        if (type === "transfer")
          setFormData({
            ...formData,
            type,
            credit: formData.debit,
            creditId: formData.debit?.id,
            debit: null,
            debitId: null,
          });
        break;
      case "expense":
        if (type === "income")
          setFormData({
            ...formData,
            type,
            debit: formData.credit,
            debitId: formData.credit?.id,
            credit: null,
            creditId: null,
          });
        if (type === "transfer")
          setFormData({ ...formData, type, debit: null, debitId: null });
        break;
      case "transfer":
        //const availAcct = credit || debit
        if (type === "income")
          setFormData({
            ...formData,
            type,
            debit: formData.credit,
            debitId: formData.credit?.id,
            credit: null,
            creditId: null,
          });
        if (type === "expense")
          setFormData({
            ...formData,
            type,
            credit: formData.credit,
            creditId: formData.credit?.id,
            debit: null,
            debitId: null,
          });
        break;
    }

    if (formData.type != type)
      view.setViewContext({
        type: null,
        groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77",
        onChange: () => {},
      });
  };

  const submitTransaction = async () => {
    const newItem: Partial<Transaction> = {
      id: formData.id,
      addByUserId: "1668b555-9788-40ed-a6e8-feeabe9538f6",
      creditId: formData.creditId,
      debitId: formData.debitId,
      amount: formData.amount,
        vendorId: formData.vendorId,
      vendor:formData.vendor,
      date: moment(formData.date).toISOString(),
      dateAdded: moment().toISOString(),
      description: formData.description || "",
      type: formData.type,
      scheduleId: formData.scheduleId,
    };

    if (transId === "new") {
      let responseSched;
      if (schedule.enabled) {
        responseSched = await mutateSchedule.create(schedule);
        }


      localStorage.setItem("stg_transaction", formData.id)

      mutateTransaction
        .create({ ...newItem, scheduleId: responseSched?.id })
        
        navigate(`../records/${moment(newItem.date).format("YYYY-MM")}/daily`);
    } else {
      mutateTransaction.update(newItem)
        navigate(`../records/${moment(newItem.date).format("YYYY-MM")}/daily`);
    }
  };

  const getCronIterations = (date?: string) => {
    if (!schedule.cronExpression) return [];
    if (!date) date = formData.date;
    let items = [];
    let isFuture = moment(formData.date).isAfter(moment().add(1, "day"));
    let interval = cron.parseExpression(schedule.cronExpression, {
      startDate: date,
    });
    let i = 0;
    while (i < iteration) {
      let x = interval.next();
      i++;
      items.push({
        date: moment(x.toDate()).toISOString(),
        iteration: i,
        label: `${i + (isFuture ? 0 : 1)} - ${moment(x.toDate()).format("yyyy-MM-DD")}`,
        isMore: false,
      });
    }

    items.push({ i: 0, label: "More Iterations", isMore: true });

    return items;
  };

  const [selectAccountProps, setSelectProps] = useState({
    show: false,
    value: null,
    onChange: () => {},
    selectType: "account",
    dest: "",
    typeId: "",
  });

  const nextScheduledTrans = () => {
    let sched = cron.parseExpression(schedule.cronExpression, {
      currentDate: moment(formData.date).toDate(),
    }); //new Cron.CronJob(formData.cronExpression, () => { }, () => { }, false,"Asia/Manila")
    //sched.setTime(new Cron.CronTime(moment(formData.date).toDate()))
    return moment(sched.next().toDate()).toISOString();
  };

  return (
    <>
      <List>
        <ListItem>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={type === "income" ? "contained" : "outlined"}
                onClick={() => setType("income")}
              >
                Income
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={type === "expense" ? "contained" : "outlined"}
                onClick={() => setType("expense")}
              >
                Expense
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={type === "transfer" ? "contained" : "outlined"}
                onClick={() => setType("transfer")}
              >
                Transfer
              </Button>
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container>
            <Grid item xs={4} alignItems="center">
              <FormLabel>Date/Time</FormLabel>
            </Grid>
            <Grid item xs={8}>
              <DateTimePicker
                //renderInput={(params) => <TextField {...params} value={moment(params.value).toLocaleString()} fullWidth variant="standard" onClick={() => view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })} />}*/}
                value={formData.date}
                onChange={(newValue: any) => {
                  setFormData((prevData) => {
                    if (schedule.enabled) {
                      schedule.cronExpression = moment(newValue).format(
                        schedule.cronId,
                      );

                      if (!!selectedIteration) {
                        let newIteration = getCronIterations(
                          newValue.toISOString(),
                        ).find(
                          (e) => e.iteration === selectedIteration.iteration,
                        );
                        schedule.endDate = newIteration.date;
                        setSelectedIteration(newIteration);
                      }
                      setSchedule({ ...schedule });
                    }

                    return { ...prevData, date: newValue.toISOString() };
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    //value={moment(params.value).toLocaleString()}
                    fullWidth
                    variant="standard"
                    onClick={(evt) => {
                      view.setViewContext({
                        type: null,
                        groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77",
                        onChange: () => {},
                      });
                      if (params.onClick) params.onClick(evt);
                    }}
                    //ts-ignore
                    InputProps={{
                      //ts-ignore
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <IconButton
                            onClick={() => {
                              setSchedule((prev) => {
                                prev.enabled = !prev.enabled;
                                if (!prev.enabled) {
                                  prev.cronId = "";
                                  prev.cronExpression = "";
                                }
                                return {
                                  ...prev,
                                  lastTransactionDate: formData.date,
                                };
                              });
                            }}
                          >
                            <IcoRepeat />
                          </IconButton>
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </ListItem>
        {schedule.enabled && (
          <>
            <ListItem>
              <Grid container>
                <Grid item xs={4}>
                  <FormLabel>Schedule</FormLabel>
                </Grid>
                <Grid item xs={8}>
                  <DropdownSelect
                    options={cronOptions}
                    getOptionValue={(opt) => opt.cron}
                    getOptionLabel={(opt) => opt.name}
                    fullWidth
                    size="small"
                    value={cronOptions.find((e) => e.cron === schedule.cronId)}
                    onChange={(value: { cron: string; name: string }) => {
                      setSchedule({
                        ...schedule,
                        cronId: value?.cron || "",
                        cronExpression: value
                          ? moment(formData.date).format(value.cron)
                          : "",
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem>
              <Grid container>
                <Grid item xs={4} alignItems="center">
                  <FormLabel>End Date</FormLabel>
                </Grid>
                <Grid item xs={8}>
                  <DropdownSelect
                    options={getCronIterations()}
                    getOptionValue={(opt) => opt.iteration}
                    getOptionLabel={(opt) => opt.label}
                    fullWidth
                    size="small"
                    value={selectedIteration}
                    onChange={(value) => {
                      if (value.isMore) {
                        setIteration(iteration + 12);
                        return;
                      } else {
                        setSelectedIteration(value);
                        setSchedule({ ...schedule, endDate: value.date });
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </ListItem>{" "}
          </>
        )}
        <ListItem>
          <Grid container>
            <Grid item xs={4} alignItems="center">
              <FormLabel>{type == "transfer" ? "From:" : "Asset:"}</FormLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                fullWidth
                autoComplete="off"
                variant="standard"
                value={
                  type === "income"
                    ? formData.debit?.name || ""
                    : formData.credit?.name || ""
                }
                onClick={() =>
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    dest: "source",
                  })
                }
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container>
            <Grid item xs={4} alignItems="center">
              <FormLabel>Vendor</FormLabel>
            </Grid>
            <Grid item xs={8}>
              <VendorTextField
                autoComplete="off"
                fullWidth
                view={view}
                variant="standard"
                value={formData.vendor}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    vendor: value,
                    vendorId: value.id,
                  })
                }
                onClick={() =>
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    dest: "vendor",
                  })
                }
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container>
            <Grid item xs={4} alignItems="center">
              <FormLabel>
                {(type == "transfer"
                  ? "To"
                  : type.charAt(0).toUpperCase() + type.slice(1)) + ":"}
              </FormLabel>
            </Grid>
            <Grid item xs={8}>
              <TextField
                autoComplete="off"
                fullWidth
                variant="standard"
                value={
                  type === "income"
                    ? formData.credit?.name || ""
                    : formData.debit?.name || ""
                }
                onClick={() =>
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    dest: "destination",
                  })
                }
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container>
            <Grid item xs={4} alignItems="center">
              <FormLabel>Amount</FormLabel>
            </Grid>
            <Grid item xs={8}>
              {/*@ts-ignore*/}
              <NumberInput
                inputProps={{ min: 0, style: { textAlign: "right" } }}
                fullWidth
                variant="standard"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e })}
                onClick={() =>
                  setSelectProps((prev) => ({ ...prev, dest: "amount" }))
                }
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setSelectProps((prev) => ({
                          ...selectAccountProps,
                          show: true,
                          dest: "amount",
                        }))
                      }
                    >
                      <Calculate />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            variant="standard"
            maxRows="2"
          />
        </ListItem>
        <ListItem>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Button
                fullWidth
                variant="contained"
                disabled={mutateTransaction.createExt.isPending || mutateTransaction.updateExt.isPending || !isSubmittable()}
                onClick={submitTransaction}

              >
                {mutateTransaction.createExt.isPending || mutateTransaction.updateExt.isPending ? <CircularProgress /> 
                : "Confirm"}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Link to="/records">
                <Button fullWidth variant="outlined">
                  Cancel
                </Button>
              </Link>
            </Grid>
          </Grid>
        </ListItem>
      </List>

      <Portal container={props.selectPortal}>
        <SelectAccount
          show={selectAccountProps.show && selectAccountProps.dest === "source"}
          onChange={(value) => {
            setFormData({
              ...formData,
              [type === "income" ? "debit" : "credit"]: value,
              [type === "income" ? "debitId" : "creditId"]: value.id,
            });
          }}
          onClose={() =>
            setSelectProps({ ...selectAccountProps, show: false, dest: "" })
          }
          value={type == "income" ? formData.debit : formData.credit}
          selectType="account"
          internalKey="destination"
          typeId="892f20e5-b8dc-42b6-10c9-08dabb20ff77"
        />

        <SelectAccount
          show={
            selectAccountProps.show &&
            sm &&
            selectAccountProps.dest === "vendor"
          }
          onChange={(value) => {
            setFormData({
              ...formData,
              vendor: value,
              vendorId: value.id,
            });
          }}
          onClose={() =>
            setSelectProps({ ...selectAccountProps, show: false, dest: "" })
          }
          value={formData.vendor}
          selectType="vendor"
          internalKey="vendor"
          typeId=""
        />

        <SelectAccount
          show={
            selectAccountProps.show && selectAccountProps.dest === "destination"
          }
          onChange={(value) => {
            console.log(value);
            setFormData({
              ...formData,
              [type === "income" ? "credit" : "debit"]: value,
              [type === "income" ? "creditId" : "debitId"]: value.id,
            });
          }}
          onClose={() =>
            setSelectProps({ ...selectAccountProps, show: false, dest: "" })
          }
          value={type === "income" ? formData.credit : formData.debit}
          selectType="account"
          internalKey="destination"
          typeId={
            type === "transfer"
              ? "892f20e5-b8dc-42b6-10c9-08dabb20ff77"
              : type === "expense"
                ? "a68ebd61-ce5d-4c99-10ca-08dabb20ff77"
                : "04c78118-1131-443f-2fa6-08dac49f6ad4"
          }
        />

        <SelectAccount
          show={selectAccountProps.show && selectAccountProps.dest === "amount"}
          onChange={(value) => {
            setFormData({
              ...formData,
              amount: value,
            });
          }}
          onClose={() =>
            setSelectProps({ ...selectAccountProps, show: false, dest: "" })
          }
          value={formData.amount}
          selectType="calculate"
          internalKey="amount"
        />
      </Portal>
    </>
  );
};

export default NewRecordForm;
