import { Divider, List, ListItem, ListItemText } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

function DailyView() {
  return (
    <div>
     <List dense>
        <ListItem sx={{ pb: 0 }}>
          <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Test 1</ListItemText>
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
     </List>
    </div>
  );
}

export default DailyView;