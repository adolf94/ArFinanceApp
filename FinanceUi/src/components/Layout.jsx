import React, { Component } from "react";
import { Grid } from "@mui/material";
import { NavMenu } from "./NavMenu";
import BottomAppBar from "./BottomAppBar";

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div>
            <Grid container sx={{pb:'56px'} }>{this.props.children}</Grid>
        <BottomAppBar />
      </div>
    );
  }
}
