
import { Chip, Divider, Fab, ListItem, Toolbar, Typography, colors } from '@mui/material'
import React, { useState } from 'react'
import { IconButton, AppBar, List, Grid, Paper, Box, Tab, Tabs} from '@mui/material'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons'
import AccountsPage from './Accounts'

import { Link } from 'react-router-dom'



const fabStyle = {
};

const fabGreenStyle = {
  position: 'absolute',
  bottom: 72,
  right: 16,
  color: 'common.white',
  bgcolor: colors.green[500],
  '&:hover': {
    bgcolor: colors.green[600],
  },
};


const Records = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };



  return <>
    <AppBar position="static">
      <Toolbar>
        <IconButton>
          <FontAwesomeIcon icon={ faChevronLeft } />
        </IconButton>
        <span className="my-1">Oct 2022</span>
        <IconButton>
          <FontAwesomeIcon icon={faChevronRight} />
        </IconButton>
      </Toolbar>
    </AppBar>
    <Grid container spacing={1}>
      <Grid item md={4} sx={{ display: {xs:'none', md:'block'} }}>
        <Paper sx={{mt:3}}>
          <AccountsPage />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8} sx={{maxHeight: '85vh', overflow:'overlay'} }>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Daily" value="1" />
            <Tab label="Calendar" value="2" />
            <Tab label="Weekly" value="3" />
            <Tab label="Monthly" value="4" />
            <Tab label="Total" value="5" />
          </Tabs>
        </Box>
        <div role="tabpanel" hidden={value != 1}>
          <Paper sx={{ my: 1 }}>
            <List>
              <ListItem dense>
                <Grid container sx={{ display: "flex", alignItems: 'center' }}>
                  <Grid item xs={6}>
                    <Typography sx={{ px: 1 }} variant="transactionHeaderDate">22</Typography> <Chip label="Mon" sx={{ mr: 1 }}></Chip> 01-2023
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="green" sx={{ px: 1, alignSelf: 'center', fontColor: 'success' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="red" sx={{ px: 1, alignSelf: 'center', fontColor: 'danger' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </Paper>
          <Paper sx={{ my: 1 }}>
            <List>
              <ListItem dense>
                <Grid container sx={{ display: "flex", alignItems: 'center' }}>
                  <Grid item xs={6}>
                    <Typography sx={{ px: 1 }} variant="transactionHeaderDate">22</Typography> <Chip label="Mon" sx={{ mr: 1 }}></Chip> 01-2023
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="green" sx={{ px: 1, alignSelf: 'center', fontColor: 'success' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="red" sx={{ px: 1, alignSelf: 'center', fontColor: 'danger' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </Paper>
          <Paper sx={{ my: 1 }}>
            <List>
              <ListItem dense>
                <Grid container sx={{ display: "flex", alignItems: 'center' }}>
                  <Grid item xs={6}>
                    <Typography sx={{ px: 1 }} variant="transactionHeaderDate">22</Typography> <Chip label="Mon" sx={{ mr: 1 }}></Chip> 01-2023
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="green" sx={{ px: 1, alignSelf: 'center', fontColor: 'success' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="red" sx={{ px: 1, alignSelf: 'center', fontColor: 'danger' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </Paper>
          <Paper sx={{ my: 1 }}>
            <List>
              <ListItem dense>
                <Grid container sx={{ display: "flex", alignItems: 'center' }}>
                  <Grid item xs={6}>
                    <Typography sx={{ px: 1 }} variant="transactionHeaderDate">22</Typography> <Chip label="Mon" sx={{ mr: 1 }}></Chip> 01-2023
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="green" sx={{ px: 1, alignSelf: 'center', fontColor: 'success' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                  <Grid item xs={3} sx={{ display: 'flex', textAlign: 'center', justifyContent: 'center' }}>
                    <Typography color="red" sx={{ px: 1, alignSelf: 'center', fontColor: 'danger' }} variant="transactionHeaderDate">0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider />
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={3}>
                    <Typography sx={{ px: 1 }} variant="body1">Transfer</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography sx={{ fontWeight: 600 }} variant="body1">Comments</Typography>
                    BPI4229
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography sx={{ px: 1, fontWeight: 600 }} variant="body1">P 0.00</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            </List>
          </Paper>
        </div>
        <div role="tabpanel" hidden={value != 2}>
          2
        </div>
        <div role="tabpanel" hidden={value != 3}>
          3
        </div>
      </Grid>

    </Grid>
    <Link to="/records/new">
      <Fab color="primary" sx={fabGreenStyle}>
        <FontAwesomeIcon color="inherit" icon={faPlus} size="xl" />
      </Fab>
    </Link> 
  </>
}

export default Records