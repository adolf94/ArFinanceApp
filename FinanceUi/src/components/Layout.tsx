import React, { Component } from "react";
import { Box, Grid2 as Grid } from "@mui/material";
import BottomAppBar from "./BottomAppBar";
import { Route, Routes } from "react-router-dom";

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
        <Routes>
            <Route path="errors/403" element={<Box sx={{alignItems:'center'} }>User has no access!</Box>} />
            <Route path="errors/Down" element={<Box sx={{ alignItems: 'center'} }>API is down?</Box>} />
            
            <Route path="*" element={<>
                <Grid container sx={{ pb: '56px' }}>{this.props.children}</Grid>
                <BottomAppBar />
            </>} />
            
      </Routes>
    );
  }
}
