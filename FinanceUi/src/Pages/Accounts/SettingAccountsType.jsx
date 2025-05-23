﻿import {
  TextField,
  DialogActions,
  Dialog,
  Button,
  DialogTitle,
    DialogContent,
    Box,
  CircularProgress
} from "@mui/material";
import react, { useEffect, useState } from "react";

import { useMutateType } from "../../repositories/accountTypes";

const NewAccountType = (props) => {
  const { show, handleClose } = props;
  const [value, setValue] = useState("");
    const mutateType = useMutateType();

  const createNewAccountType = () => {
    mutateType
      .createAsync({
        name: value,
        enabled: true,
      })
      .then(() => {
        setValue("");
        handleClose();
      });
  };

  return (
    <>
      <Dialog open={show} onClose={handleClose}>
        <DialogTitle>New Type</DialogTitle>
        <DialogContent>
          <TextField
            label="Account Type Name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
            <Box sx={{ position: 'relative' }}>

                <Button onClick={createNewAccountType} disabled={mutateType.createExt.isPending}>Create</Button>
                {mutateType.createExt.isPending && <CircularProgress
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

export default NewAccountType;
