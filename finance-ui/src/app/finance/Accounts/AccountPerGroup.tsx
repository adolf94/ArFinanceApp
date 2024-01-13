import { Divider, IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ExpandMore as IcoExpandMore, ExpandLess as IcoExpandLess } from '@mui/icons-material'
import React, { useState } from 'react';

function AccountsPerGroup(props : any) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <List dense>
        <ListItem sx={{ pb: 0 }}>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Test 1</ListItemText>
          {open ? <IcoExpandLess /> : <IcoExpandMore />}
        </ListItem>
        <Divider />
        <ListItem dense sx={{ backgroundColor: grey[200] }}>
          <ListItemText>Test 2</ListItemText>
        </ListItem>
        <Divider />
        <ListItem sx={{ backgroundColor: grey[200] }}>
          <ListItemText>Test 3</ListItemText>
        </ListItem>
        <Divider />
        <ListItem sx={{ backgroundColor: grey[200] }}>
          <ListItemText>Test 4</ListItemText>
        </ListItem>
        <Divider />
        <ListItem sx={{ backgroundColor: grey[200] }}>
          <ListItemText>Test 5</ListItemText>
        </ListItem>
        <Divider />
        <ListItem sx={{ backgroundColor: grey[200] }}>
          <ListItemText>Test 6</ListItemText>
        </ListItem>
        <Divider />
      </List>
    </div>
  );
}

export default AccountsPerGroup;