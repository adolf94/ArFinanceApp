﻿import React, {
  useState,
  useContext,
  SetStateAction,
  useEffect,
  useMemo,
} from "react";
import {
  List,
  Grid2 as Grid,
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
  Chip,
  InputAdornment
} from "@mui/material";
import { SelectAccountContext } from "../NewRecord";
//import { makeStyles } from '@mui/styles'
import { DateTimePicker } from "@mui/x-date-pickers";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import moment from "moment";
import SelectAccount from "./SelectAccount";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid, v7 } from "uuid";
import { Calculate, Repeat as IcoRepeat } from "@mui/icons-material";
import { Account, ScheduledTransactions, Transaction } from "FinanceApi";
import { fetchTransactionById, useMutateTransaction } from "../../repositories/transactions";
import {useConfirm} from 'material-ui-confirm'
import NumberInput from "../../common/NumberInput";
import DropdownSelect from "../../common/Select";
import cron from "cron-parser";
import { useMutateSchedule } from "../../repositories/scheduledTasks";
import VendorTextField from "./VendorTextField";
import { getToken } from "../../components/fnApi";
import { getOneHookMsg, HOOK_MESSAGES } from "../../repositories/hookMessages";
import { ACCOUNT, fetchByAccountId } from "../../repositories/accounts";
import db from "../../components/LocalDb/AppDb";
import hookMappings from  "../Notifications/hooksMapping.json"
import selectionByHook, { getReferenceName, subtituteText } from "../Notifications/selectionByHook";
import { logReferenceInstance } from "../../repositories/hookReference";
import useSubmitTransaction from "./useSubmitTransaction";
import numeral, { Numeral } from "numeral";
import PillPopover from "./PillPopover";

const cronOptions = [
  { name: "Monthly", cron: "0 0 DD * *" },
  { name: "Twice a month 15/30", cron: "0 0 15,[L] * *" },
   { name: "Weekly (Friday)", cron: "0 0 0 * * 5"}
];

interface NewRecordFormProps {
  // formData: Partial<Transaction>;
  // hookData:any,    
  // setHookData:(data:any)=>any,
  // setFormData: React.Dispatch<Omit<SetStateAction<Transaction>, "id">>;
  // resetFormData : ()=>void;
  selectPortal: Element;
}



const defaultValue = {
  type: "expense",
  date: moment().toISOString(),
  credit: null,
  debit: null,
  amount: null,
  vendor: null,
  description: "",
};

const defaultHooksValue = {
  hook: null,
  selectedConfig: null,
  configs:[],
  references:{
    vendor: "",
    debit:"",
    credit:""
  }
}





const NewRecordForm = (props: NewRecordFormProps) => {
  const queryClient = useQueryClient();

  
  const [formData, setFormData] = useState<
      Partial<Transaction & ScheduledTransactions>
        >({ ...defaultValue, id: v7() });
  const [hooks, setHooks] = useState(defaultHooksValue)




  const view = useContext<any>(SelectAccountContext);
  const mutateTransaction = useMutateTransaction();
  const mutateSchedule = useMutateSchedule();
    const navigate = useNavigate();
  const { transId } = useParams();
  const confirm = useConfirm()

  const [query, setQuery] = useSearchParams();

  const type = formData.type;
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("lg"));
  const [iteration, setIteration] = useState(12);
  const [selectedIteration, setSelectedIteration] = useState<any>();
    const { state } = useLocation() as { state: any };

  const [selectAccountProps, setSelectProps] = useState({
    show: false,
    value: null,
    onChange: () => {},
    selectType: "account",
    dest: "",
    typeId: "",
  });
  const [schedule, setSchedule] = useState<Partial<ScheduledTransactions>>({
    enabled: false,
    cronId: "",
    cronExpression: "",
    endDate: "",
    dateCreated: moment().toISOString(),
    id: v7(),
    lastTransactionDate: moment().toISOString(),
  });
  
  const resetFormData = ()=>{
    setFormData({ ...defaultValue,credit:formData.credit, creditId:formData.creditId, date: formData.date, id: v7() })
    setHooks(defaultHooksValue)
    setQuery({})
  }

  const doSubmit = useSubmitTransaction({
    transaction:formData, 
    schedule, 
    transactionId:transId,
    notification:hooks.hook,  
    hookConfig:hooks.selectedConfig
  })


  const isSubmittable = useMemo((() => {
    const { creditId, debitId, vendorId, amount} = formData;
    if (!(creditId && debitId && vendorId)) return false;
    if (schedule.enabled) {
      const { cronExpression, endDate } = schedule;
      if (!(cronExpression && endDate)) return false;
    }
    if(amount === null || amount === undefined) return false;
    return true;
  }),[formData]);

    const submitTransaction = (redirectToHome)=>{
      if(!isSubmittable) return
      const whilewaiting = ()=>{
          const monthKey = moment(formData.date).format("YYYY-MM")
          if(transId == "new"){
          if(redirectToHome) {
            if(!!hooks.hook?.id) navigate(-1)
            if(!hooks.hook?.id) navigate(`../records/${monthKey}/daily`)
          };
          if(!redirectToHome) {
            resetFormData()
          }
        }else{
          navigate(`../records/${monthKey}/daily`);
        }
      }
      return doSubmit(whilewaiting)
    }
  useEffect(() => {
      //when state is included on routing / navigate
      if (!!state?.credit) {
          setFormData(prev => ({ ...prev, credit: state.credit, creditId: state.credit?.id }))
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.credit, setFormData])
  
  useEffect(() => {
    const fn = (evt)=>{
      if(evt.code === "Backquote" && evt.altKey){
        setFormData((prevValue)=>{
  
          let types = ["transfer", "expense", "income"];
          let currentIndex = types.indexOf(prevValue.type);
          let newIndex = currentIndex == 0 ? types.length - 1 : currentIndex - 1;
          
          prevValue.type =types[newIndex]
          return {...prevValue}
        })
      }
      console.log(evt.code)
      if(evt.code === "KeyS" && evt.altKey){
        isSubmittable && submitTransaction(false)
      }

    }
    window.addEventListener("keyup",fn );
    return ()=>{
      window.removeEventListener("keyup", fn)
    }

  }, [isSubmittable, formData]);
  
  

    useEffect(() => {
        getToken();
      (async () => {
        if (
          transId == "new"
        ) {
          let date = query.get("date")
            ? moment(query.get("date"))
                .hour(moment().hour())
                .minute(moment().minute())
                .toISOString()
            : moment().toISOString();

          let hookId = query.get("hookId")
          if(!!hookId){
              let configs = []
              let hook = await queryClient.ensureQueryData({
                queryKey: [HOOK_MESSAGES, { id: hookId }],
                queryFn: () => getOneHookMsg(hookId, moment(date).format("YYYY-MM-01") ),
              })
              if(!!hook) {
                configs = hookMappings.filter(e=>e.config==hook.extractedData?.matchedConfig)
              }
              if(!!hook.transactionId){
                navigate(`../transactions/${hook.transactionId}`)
                return  
              }
              setHooks({configs,hook, selectedConfig: null})
          }
          

          let credit = query.get("creditId")
            ? await queryClient.ensureQueryData({
                queryKey: [ACCOUNT, { id: query.get("creditId") }],
                queryFn: () => fetchByAccountId(query.get("creditId")),
              })
            : null;
            setFormData({ ...defaultValue, id: v7(), date, credit, creditId: credit?.id });
        } else {
          let type = "offline"
          db.transactions.filter(e=>e.id == transId)
            .first().then(tr=>{
              if(type == "online") return
              setFormData(tr)
            })

          fetchTransactionById(transId)
            .then(e=>{
              setFormData((prev)=>{
                if(prev.id === e.id && prev.epochUpdated === e.epochUpdated) return prev
                return e
              })
            })



        }
      })();
  }, [transId, query, queryClient]);



  const onSelectedConfigChange = async (data)=>{

      if(!data) return
      let selectedConfig = data
      const {hook} = hooks
      let amount = hook.extractedData.amount;


      const isCreditRefSameAsVendor = selectedConfig.vendor == selectedConfig.credit
      const isDebitRefSameAsVendor = selectedConfig.vendor == selectedConfig.debit
      let vendor, credit, debit

      let references = {
        vendor : getReferenceName(selectedConfig.vendor, hook),
        credit : getReferenceName(selectedConfig.credit, hook),
        debit : getReferenceName(selectedConfig.debit, hook)
      }



      vendor = (!isCreditRefSameAsVendor&&!isDebitRefSameAsVendor) ?selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
        [ "vendor"]) : null


      let creditVendor = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, 
        [ "account", ...(isCreditRefSameAsVendor?["vendor"]:[]) ])
      
      let debitVendor = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, 
          [ "account", ...(isDebitRefSameAsVendor?["vendor"]:[]) ])
          

      setHooks({...hooks,references, selectedConfig})

      await creditVendor.then(d=>{
        if(isCreditRefSameAsVendor) {
          [credit, vendor] = d
        } else { [credit] = d}
      })
      
      await debitVendor.then(d=>{
        if(isDebitRefSameAsVendor) {
          [debit, vendor] = d
        } else { [debit] = d}
      })
      // let vendor = selectionByHook(selectedConfig.vendor, hook, selectedConfig.type, "vendor")
      // let credit = selectionByHook(selectedConfig.credit, hook, selectedConfig.type, "account")
      // let debit = selectionByHook(selectedConfig.debit, hook, selectedConfig.type, "account")
      
      let availDate = hook.jsonData?.timestamp ?? hook.date
      let datetime = moment(availDate).toISOString();

        setFormData({
          ...formData,
          type:selectedConfig.type,
          date: datetime,
          amount: numeral(amount).value(),
          debit,
          debitId: debit?.id,
          credit,
          creditId: credit?.id,
          vendor,
          vendorId:vendor?.id,
          description: subtituteText(data.remarks, hook) 
        })

  }


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

  useEffect(()=>{
    console.log(selectAccountProps.show)
  }, [selectAccountProps.show])
  
  const nextScheduledTrans = () => {
    let sched = cron.parseExpression(schedule.cronExpression, {
      currentDate: moment(formData.date).toDate(),
    }); //new Cron.CronJob(formData.cronExpression, () => { }, () => { }, false,"Asia/Manila")
    //sched.setTime(new Cron.CronTime(moment(formData.date).toDate()))
    return moment(sched.next().toDate()).toISOString();
  };

  return <Box width="100%">
      <List>
        <ListItem>
          <Grid container width="100%" spacing={2}>
            <Grid size={4}>
              <Button
                fullWidth
                variant={type === "income" ? "contained" : "outlined"}
                onClick={() => setType("income")}
              >
                Income
              </Button>
            </Grid>
            <Grid size={4}>
              <Button
                fullWidth
                variant={type === "expense" ? "contained" : "outlined"}
                onClick={() => setType("expense")}
              >
                Expense
              </Button>
            </Grid>
            <Grid size={4}>
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
          <Grid container sx={{width:"100%",textAlign:'right'}}>
            <Grid size={4}sx={{textAlign:'left'}}>
              {hooks.hook&&<PillPopover text={hooks.hook?.rawMsg}><Chip label="Notification Text" size="small" variant="filled" color="primary" ></Chip></PillPopover>}
            </Grid>
            <Grid size={8}>
              {hooks.configs.map(e=>
                <Chip  color="primary" size="small" label={e.displayName}
                  variant={hooks.selectedConfig?.subConfig == e.subConfig? "filled":"outlined"}
                  sx={{mx:1}}
                  onClick={()=>onSelectedConfigChange(e)}
                />)
              }
 
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container width="100%" >
            <Grid size={4} alignItems="center">
              <FormLabel>Date/Time</FormLabel>
            </Grid>
            <Grid size={8}>
              <DateTimePicker
                //renderInput={(params) => <TextField {...params} value={moment(params.value).toLocaleString()} fullWidth variant="standard" onClick={() => view.setViewContext({ type: null, groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77", onChange: () => { } })} />}*/}
                value={moment(formData.date)}
                onChange={(newValue) => {
                  if(moment.isMoment(newValue))
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

                slots={{
                  inputAdornment: (params)=><InputAdornment position="end">
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
                    {params.children}
                  </InputAdornment>
                }}
                slotProps={{
                  textField:{
                    fullWidth:true,
                    variant:"standard",
                    onFocus:(evt) => {
                      view.setViewContext({
                        type: null,
                        groupId: "892f20e5-b8dc-42b6-10c9-08dabb20ff77",
                        onChange: () => {},
                      });
                      // if (params.onClick) params.onClick(evt);
                    }
                    // slotProps:{
                    //   endAdornment:(props)=><>
                    //            <IconButton
                    //              onClick={() => {
                    //                setSchedule((prev) => {
                    //                  prev.enabled = !prev.enabled;
                    //                  if (!prev.enabled) {
                    //                    prev.cronId = "";
                    //                    prev.cronExpression = "";
                    //                  }
                    //                  return {
                    //                    ...prev,
                    //                    lastTransactionDate: formData.date,
                    //                  };
                    //                });
                    //              }}
                    //            >
                    //              <IcoRepeat />
                    //            </IconButton>
                    //          </>
                    // }
                    // slotProps:{
                    //   input:(params)=>({
                    //     endAdornment: (
                    //       <>
                    //         {/* {params.endAdornment} */}
                    //         <IconButton
                    //           onClick={() => {
                    //             setSchedule((prev) => {
                    //               prev.enabled = !prev.enabled;
                    //               if (!prev.enabled) {
                    //                 prev.cronId = "";
                    //                 prev.cronExpression = "";
                    //               }
                    //               return {
                    //                 ...prev,
                    //                 lastTransactionDate: formData.date,
                    //               };
                    //             });
                    //           }}
                    //         >
                    //           <IcoRepeat />
                    //         </IconButton>
                    //       </>
                    //     )
                    //   })
                    // }
                  }
                }}
              />
            </Grid>
          </Grid>
        </ListItem>
        {schedule.enabled && (
          <>
            <ListItem>
              <Grid container>
                <Grid size={4}>
                  <FormLabel>Schedule</FormLabel>
                </Grid>
                <Grid size={8}>
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
                <Grid size={4} alignItems="center">
                  <FormLabel>End Date</FormLabel>
                </Grid>
                <Grid size={8}>
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
          <Grid container width="100%" >
            <Grid size={4} alignItems="center">
              <FormLabel>{type == "transfer" ? "From:" : "Asset:"}</FormLabel>
            </Grid>
            <Grid size={8}>
              <TextField
                fullWidth
                autoComplete="off"
                variant="standard"
                value={
                  type === "income"
                    ? formData.debit?.name || ""
                    : formData.credit?.name || ""
                }
                onFocus={(evt) =>{
                  evt.target.blur()
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    dest: "source",
                  })
                }}
                helperText={!!hooks.selectedConfig?type === "income"
                  ? hooks.references?.debit 
                  : hooks.references?.credit : ""}
                
                // slotProps={{
                //   input: {
                //     startAdornment: <InputAdornment position="start">kg</InputAdornment>,
                //   },
                // }}

              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container width="100%" >
            <Grid size={4} alignItems="center">
              <FormLabel>Vendor</FormLabel>
            </Grid>
            <Grid size={8}>
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
                onClick={(evt) =>{
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    targeted: evt.target,
                    dest: "vendor",
                  })
                }}
                
                helperText={!!hooks.selectedConfig? hooks.references?.vendor : ""} 
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container width="100%" >
            <Grid size={4} alignItems="center">
              <FormLabel>
                {(type == "transfer"
                  ? "To"
                  : type.charAt(0).toUpperCase() + type.slice(1)) + ":"}
              </FormLabel>
            </Grid>
            <Grid size={8}>
              <TextField
                autoComplete="off"
                fullWidth
                variant="standard"
                value={
                  type === "income"
                    ? formData.credit?.name || ""
                    : formData.debit?.name || ""
                }
                onFocus={(evt) =>{
                  evt.target.blur()
                  setSelectProps({
                    ...selectAccountProps,
                    show: true,
                    dest: "destination",
                  })
                }}
                
                helperText={!!hooks.selectedConfig? type === "income"
                  ? hooks.references?.credit 
                  : hooks.references?.debit : ""} 
              />
            </Grid>
          </Grid>
        </ListItem>
        <ListItem>
          <Grid container width="100%" >
            <Grid size={4} alignItems="center">
              <FormLabel>Amount</FormLabel>
            </Grid>
            <Grid size={8}>
              {/*@ts-ignore*/}
              <NumberInput
                inputProps={{ min: 0, style: { textAlign: "right" } }}
                fullWidth
                variant="standard"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e || 0 })}
                onClick={() =>
                  setSelectProps((prev) => ({ ...prev, dest: "amount" }))
                }
                onKeyUp={(evt)=>{
                  console.log(`${evt.key} ${evt.altKey}`)
                  switch (evt.key) {
                    case "/":
                    case "*":
                    case "+":
                    case "=":
                      console.debug("Called Focus");
                      
                      setSelectProps((prev) => ({
                        ...selectAccountProps,
                        show: true,
                        dest: "amount",
                        operation:evt.key
                      }))
                      evt.target.blur();
                      evt.preventDefault();
                      return true
                    case  "KeyS":
                      if(evt.altKey){
                        setFormData({
                          ...formData,
                          amount: e.target.value || 0
                        })
                        setTimeout(()=>{
                          submitTransaction(false)
                        }, 200)
                      }
                    default:
                      return false
                  }
                }}
                
                
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() =>
                        setSelectProps((prev) => ({
                          ...selectAccountProps,
                          show: true,
                          dest: "amount",
                          operation:""
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
          <Grid container spacing={2} width="100%" >
            <Grid size={transId=="new"?4:8}>
              <Button
                  fullWidth
                  variant="contained"
                  disabled={mutateTransaction.createExt.isPending || mutateTransaction.updateExt.isPending || !isSubmittable}
                  onClick={()=>submitTransaction(true)}

              >
                {mutateTransaction.createExt.isPending || mutateTransaction.updateExt.isPending ? <CircularProgress />
                    : "Confirm"}
              </Button>
            </Grid>
            {transId == 'new' && <Grid size={5}>
              <Button
                  fullWidth
                  variant="contained"
                  disabled={mutateTransaction.createExt.isPending || mutateTransaction.updateExt.isPending || !isSubmittable}
                  onClick={()=>submitTransaction(false)}

              >
                Submit and New
              </Button>
            </Grid>}
            <Grid size={transId=="new"?3:4}>
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
          operation={selectAccountProps.operation || ""}
          selectType="calculate"
          internalKey="amount"
        />
      </Portal>
    </Box>
};

export default NewRecordForm;
