import {
  TextField,
  DialogActions,
  Dialog,
  Button,
  Select,
  DialogTitle,
  DialogContent,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import react, { useEffect, useState } from "react";
import React from "react";
import db from "../../components/LocalDb";
import { ACCOUNT_TYPE, fetchTypes } from "../../repositories/accountTypes";
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_GROUP, fetchGroups } from "../../repositories/accountgroups";
import { Account, AccountGroup, AccountType } from "FinanceApi";
import { useMutateAccount } from "../../repositories/accounts";
import { green } from "@mui/material/colors";

const NewAccount = (props) => {
  const { show, handleClose } = props;
  const { data: accountTypes } = useQuery<AccountType[]>({
    queryKey: [ACCOUNT_TYPE],
    queryFn: fetchTypes,
  });
  const { data: accountGroups } = useQuery<AccountGroup[]>({
    queryKey: [ACCOUNT_GROUP],
    queryFn: fetchGroups,
  });
  const [accountType, setAccountType] = useState<AccountType>(null);

  const { createAsync, createExt } = useMutateAccount();

  const [form, setForm] = useState<Partial<Account>>({
    name: "",
    balance: 0,
    accountGroup: null,
    accountGroupId: "",
    periodStartDay: 1,
    resetEndOfPeriod: false,
    enabled: true,

  });

  const createNewAccount = () => {
    let item = {
        ...form,
        resetEndOfPeriod: accountType.shouldResetPeriodically
    };

    createAsync(item).then(() => {
      setForm({
        name: "",
        balance: 0,
        accountGroup: null,
        accountGroupId: "",
        resetEndOfPeriod: false,
        periodStartDay: 1,
        enabled: true,
      });
      handleClose();
    });
  };

  return (
    <>
      <Dialog open={show} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle>New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            <div className="mt-2">
              <FormControl fullWidth sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-select-small">Account Type</InputLabel>
                <Select value={accountType?.id || ""} label="Account Type">
                  {(accountTypes || []).map((d) => (
                    <MenuItem
                      key={d.id}
                      value={d.id}
                      onClick={() => {
                        setAccountType(d);
                      }}
                    >
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="mt-2">
              <FormControl fullWidth sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="demo-select-small">Account Group</InputLabel>
                <Select value={form.accountGroupId || ""} label="Account Group">
                  {(accountGroups || [])
                    .filter((g) => accountType?.id === g.accountTypeId)
                    .map((d) => (
                      <MenuItem
                        key={d.id}
                        value={d.id}
                        onClick={() =>
                          setForm({
                            ...form,
                            accountGroup: d,
                            accountGroupId: d.id,
                          })
                        }
                      >
                        {d.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth sx={{ m: 1 }}>
                <TextField
                  label="Account Type Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  variant="standard"
                />
              </FormControl>
            </div>
            <Box>
              <Grid container>
                {form.accountGroup?.isCredit && (
                  <Grid item xs={6} sx={{ pr: 1 }}>
                    <FormControl fullWidth sx={{ m: 1 }}>
                      <TextField
                        label="Cutoff start date"
                        type="number"
                        max={31}
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "^[0-9]{2}$",
                        }}
                        fullWidth
                        value={form.periodStartDay}
                        onChange={(e) => {
                          if (!e.target.value) e.target.value = "1";
                          if (
                            Number.parseInt(e.target.value) < 1 ||
                            Number.parseInt(e.target.value) > 31
                          )
                            e.target.value = "";
                          setForm({
                            ...form,
                            periodStartDay: Number.parseInt(e.target.value),
                          });
                        }}
                        variant="standard"
                      />
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={form.accountGroup?.isCredit ? 6 : 12}>
                  <FormControl fullWidth sx={{ m: 1 }}>
                    <TextField
                      label="Balance"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9.]*" }}
                      fullWidth
                      value={form.balance}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          balance: Number.parseFloat(e.target.value),
                        })
                      }
                      variant="standard"
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Box sx={{position: 'relative' }}>
                      <Button onClick={createNewAccount} disabled={createExt.isPending}> Create </Button>
                      {createExt.isPending && <CircularProgress
                          size={24}
                          sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              marginTop: '-12px',
                              marginLeft: '-12px',
                          }} />}
                  </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewAccount;
