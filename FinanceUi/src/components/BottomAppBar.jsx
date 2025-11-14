import AppBar from "@mui/material/AppBar";
import React, { useState } from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {
  faBars,
  faBook,
  faBurger,
  faCalendar,
  faCog,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { AccountBalanceWallet, ReceiptLong, History, Settings} from "@mui/icons-material";

const BottomAppBar = (props) => {
  const navigate = useNavigate();
  const [value, setValue] = useState("Records");

  const onNav = (evt, value) => {
    console.log(evt, value);
    setValue(value);
    navigate(value);
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
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
    </AppBar>
  );
};

export default BottomAppBar;
