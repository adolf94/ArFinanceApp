import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons"
import React, { useState, createContext, useRef } from 'react'
import { AppBar, IconButton, Button, Toolbar, Typography, Grid, Dialog, List, ListItem, FormLabel, TextField, useTheme, useMediaQuery, Box } from '@mui/material'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
//import { makeStyles } from '@emotion/styles'

import NewRecordForm from './NewRecordComponents/NewRecordForm'
import SelectAccount from "./NewRecordComponents/SelectAccount"
import moment from 'moment'


export const SelectAccountContext = createContext({})
//const useStyles = makeStyles({
 
//  dialogHalf: {
//    position: "absolute",
//    top: "80%",
//    left: "50%",
//    transform: "translate(-50%, -50%)"
//  }
//});
const NewRecordPage = (props) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    date: moment().toISOString(),
    credit: null,
    debit: null,
    amount: null,
    vendor:null
  })
  const theme = useTheme();
  const con = useRef()
  //const styles = useStyles();
  const sm = useMediaQuery(theme.breakpoints.down('md'));

  const [selectView, setSelectView] = useState({
    groupId:null,
    onChange: () => { },
    type: "",
    searchValue: ""
  })

  const setViewContext = (data) => {

    setSelectView({ ...selectView, ...data });
  }
  return <> <AppBar position="static">
    <Toolbar>
      <Link to="/records">
        <IconButton size="large" >
          <FontAwesomeIcon icon={faArrowLeftLong} />
        </IconButton>
      </Link>
      <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">New</Typography>
     
    </Toolbar>
  </AppBar>
    <SelectAccountContext.Provider value={{ ...selectView, setViewContext }}>
      <Grid container>
        <Grid item xs={12} lg={6}>
          <NewRecordForm formData={formData} selectPortal={con.current}  setFormData={setFormData}    />
        </Grid>

        <Grid item sm={6}>
          <Box ref={con}></Box>
        </Grid>
       
      </Grid>
    </SelectAccountContext.Provider>
  </>
}

export default NewRecordPage
