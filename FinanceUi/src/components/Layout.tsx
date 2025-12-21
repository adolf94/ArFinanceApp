import React, { Component, useContext, useRef, useState } from "react";
import { Box, Grid2 as Grid } from "@mui/material";
import BottomAppBar from "./BottomAppBar";
import { Route, Routes } from "react-router-dom";
import { useContainerDimensions } from "../common/useContainerDimensions";
const BottomAppBarSizeContext = React.createContext({})

export const Layout = (props)=>{
    const appbarRef = useRef()

    const dimensions = useContainerDimensions(appbarRef)

    return (
        <BottomAppBarSizeContext.Provider value={dimensions}>
          <Routes>
              <Route path="errors/403" element={<Box sx={{alignItems:'center'} }>User has no access!</Box>} />
              <Route path="errors/Down" element={<Box sx={{ alignItems: 'center'} }>API is down?</Box>} />
              
              <Route path="*" element={<>
                  <Grid container sx={{ pb: '56px' }}>{props.children}</Grid>
                  <BottomAppBar barRef={appbarRef} />
              </>} />
              
        </Routes>
      </BottomAppBarSizeContext.Provider>
    );
}

export const useBottomAppBarSize = ()=>{
  const size = useContext(BottomAppBarSizeContext)
  return size
}

export default Layout;