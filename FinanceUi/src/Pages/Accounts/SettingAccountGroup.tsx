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
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import api from "../../components/api";
import useDropdown from "../../components/useDropdown";
import db from "../../components/LocalDb";
import { ACCOUNT_TYPE, fetchTypes } from "../../repositories/accountTypes";
import { useQuery } from "@tanstack/react-query";
import { useMutateGroups } from "../../repositories/accountgroups";
import { AccountGroup } from "FinanceApi";

const NewAccountGroup = (props: any) => {
  const { handleClose, show } = props;

  const { data: accountTypes, isLoading: loadingTypes } = useQuery({
    queryKey: [ACCOUNT_TYPE],
    queryFn: fetchTypes,
  });
  const mutateGroups = useMutateGroups();
  const { accountGroups, set } = useDropdown();
  const [form, setForm] = useState<Partial<AccountGroup>>({
    name: "",
    accountTypeId: "",
    isCredit: false,
    enabled: true,
  });

  const createNewAccountGroup = () => {
    mutateGroups
      .createAsync({
        name: form.name,
        accountTypeId: form.accountTypeId,
        isCredit: form.isCredit,
        enabled: true,
      })
      .then(() => {
        handleClose();

        setForm({
          name: "",
          accountTypeId: "",
          isCredit: false,
          enabled: true,
        });
      });
  };

  return (
    <>
      <Dialog open={show} maxWidth="sm" fullWidth onClose={handleClose}>
        <DialogTitle>New Type</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ p: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-select-small">Account Type</InputLabel>
              <Select label="Account Type" value={form.accountTypeId || ""}>
                {(accountTypes || []).map((d) => (
                  <MenuItem
                    key={d.id}
                    value={d.id}
                    onClick={() =>
                      setForm({ ...form, accountType: d, accountTypeId: d.id })
                    }
                  >
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              label="Account Type Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              variant="standard"
            />
          </Box>
          <Box sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isCredit}
                  onChange={() =>
                    setForm({ ...form, isCredit: !form.isCredit })
                  }
                />
              }
              label="Credit Cards"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={createNewAccountGroup} disabled={mutateGroups.createExt.isPending}>
                      {mutateGroups.createExt.isPending ? <CircularProgress size="small" /> : "Confirm" }
                  </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewAccountGroup;
