import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { Fab, Toolbar, colors } from '@mui/material'
import { useState } from 'react'
import { AppBar } from '@mui/material'
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
      <Grid item xs={12} md={8}>
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
          1
        </div>
        <div role="tabpanel" hidden={value != 2}>
          2
        </div>
        <div role="tabpanel" hidden={value != 3}>
          3
        </div>
        <Link to="/records/new">
          <Fab color="primary" label="Add" sx={fabGreenStyle}>
            <FontAwesomeIcon color="inherit" icon={faPlus} size="xl" />
          </Fab>
        </Link>
      </Grid>
    </Grid>
  </>
}

export default Records