import AppBar from "@mui/material/AppBar";
import React, { useRef, useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { AccountBalanceWallet, ReceiptLong, History, Settings, Add} from "@mui/icons-material";
import {Box ,Fab,useTheme} from "@mui/material"

const BottomAppBar = (props) => {
  const navigate = useNavigate();
  const appbarRef = useRef()
  const theme = useTheme()
  const [value, setValue] = useState("Records");
  const onNav = (evt, value) => {
    console.log(evt, value);
    setValue(value);
    navigate(value);
  };



  return (
    
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Fab 
        color="primary"  
        sx={{ 
          position: 'absolute', 
          top: -20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          boxShadow: theme.shadows[5]
        }}
      >
        <Add />
      </Fab>
      <BottomNavigation showLabels value={value} onChange={onNav}>
        <BottomNavigationAction
          value="/records"
          label={"Records"}
          icon={<ReceiptLong />}
        />
        <BottomNavigationAction
          value="/notifications"
          label={"Activity"}
          icon={<History />}
        />
        <Box sx={{ width: 60 }} />
        <BottomNavigationAction
          value="/accounts"
          label={"Accounts"}
          icon={<AccountBalanceWallet />}
        />
        <BottomNavigationAction
          value="/settings"
          label={"Settings"}
          icon={<Settings />}
        />
      </BottomNavigation>
    </Box>
  );
};

export default BottomAppBar;
