import { Box, Button, Collapse, Dialog, Grid, List, ListItem, ListItemButton, ListItemText, Paper, Stack, TextField } from '@mui/material';
import { Add, ExpandLess as IcoExpandLess, ExpandMore as IcoExpandMore} from '@mui/icons-material'

import React, { useState } from 'react';
import useHeaderContext from '../../common/headerContext';

function ExpensesList() {
  const [open,setOpen] = useState(true)
  const ctx = useHeaderContext()
  //const [open, setOpen] = useState(false)
  const [newForm, setNewForm] = useState({
      accountGroup: null,
      accountName: ""
    })


  return (<Box sx={{ mt: ctx.height + 'px'}}>
    <List dense>
        <ListItemButton>
          <ListItemText primaryTypographyProps={{variant:'subtitle2'}}>Test 1</ListItemText>
          {open ? <IcoExpandLess onClick={() => setOpen(false)} /> : <IcoExpandMore onClick={() => setOpen(true)} />}
          <Add onClick={() => setOpen(false)} /> 
        </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          <ListItem>
            <ListItemText>Test 2</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Test 3</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Test 4</ListItemText>
          </ListItem>
          <ListItem>
            <ListItemText>Test 5</ListItemText>
          </ListItem>
        </List>
      </Collapse>
    </List>
    <Dialog open={open}>
      <Paper sx={{ p: 2 }}>
        <Stack>
          <Box sx={{ pb: 2 }}>
            <TextField value={newForm.accountGroup?.name || ""} fullWidth label="Expense Category" />
          </Box>
          <Box sx={{ pb: 2 }}>
            <TextField value={newForm.accountName || ""} fullWidth label="Expense SubCategory" />
          </Box>

          <Box>
            <Button variant="contained" fullWidth>Submit</Button>
          </Box>

        </Stack>
      </Paper>

    </Dialog>
  </Box>
  );
}

export default ExpensesList;