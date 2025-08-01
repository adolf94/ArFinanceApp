﻿import { Backspace, Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid2 as Grid,
  IconButton,
  Paper,
  SxProps,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { evaluate } from "mathjs";
import { useEffect } from "react";

const button: SxProps = {
  p: 2,
  fontSize: "x-large",
};

const Calculator = (props) => {
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");
  const [equalClicked, setEqualClicked] = useState(false);

  useEffect(() => {

    setFormula((props.value||"0") + props.operation);
    setResult((props.value||"0") );
  }, [props.value, props.operation]);

  const append = (val) => {
    setFormula((formula)=>{
      let newFormula;
      if (equalClicked) {
        if (Number.isNaN(Number.parseInt(val))) {
          newFormula = result + val;
        } else {
          newFormula = val;
        }
      } else {
        newFormula = formula + val;
      }
      evalu(newFormula);
      setEqualClicked(false);
      return newFormula;
    })
  };

  const backspace = () => {
    let newFormula = formula.substring(0, formula.length - 1);
    setFormula(newFormula);
    evalu(newFormula);
    setEqualClicked(false);
  };

  const evalu = (newFormula) => {
    let newResult;
    try {
      newResult = evaluate(newFormula);
      setResult(newResult);
    } catch (ex) {}
  };
  
  const onEqual = () => {
    evalu(formula);
    setEqualClicked(true);
  };

  const onDone = () => {
    props.onChange(result);
    props.onClose();
  };

  useEffect(() => {
    console.debug("calculator Keys added!")
    let eventFn = (evt)=>{

      console.log(evt.code)
      if(evt.key === "=") return onEqual();
      if(evt.key === "Backspace") return backspace();
      if(evt.key === "Delete") return backspace();
      if(evt.key === "Enter") return onDone();
      if(evt.key === "Escape") return setFormula("");
      let listenTo = [".","-","+","/","*","=","1","2","3","4","5","6","7","8","9", "0"];
      if(!listenTo.includes(evt.key)) return
      append(evt.key);
    }
    window.addEventListener("keydown", eventFn);
    
    return ()=> {
      console.debug("calculator Keys removed!")

      window.removeEventListener("keydown", eventFn)
    }
  }, [formula,equalClicked]);

  return (
    <>
      <Box>
        <Grid container sx={{ px: 1, pt: 1 }}>
          <Grid size={12}>
            <Grid container sx={{ display: "flex", justifyContent: "end" }}>
              <Grid sx={{ flexShrink: 1 }}>
                <IconButton onClick={() => props.onClose()}>
                  <Close />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={12}>
            <TextField variant="standard" fullWidth value={formula} />
          </Grid>
          <Grid size={12}>
            <TextField
              variant="standard"
              fullWidth
              sx={{ fontSize: "large", py: 1,textAlign:'right' }}
              slotProps={{
                htmlInput:{sx:{ fontSize: "large", textAlign: "end" }},
              }}
              value={result}
            />
          </Grid>
        </Grid>
        <Grid container>
          <Grid size={9}>
            <Grid container>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => setFormula("")}>
                  AC
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("/")}>
                  /
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("*")}>
                  x
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("1")}>
                  1
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("2")}>
                  2
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("3")}>
                  3
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("4")}>
                  4
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("5")}>
                  5
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("6")}>
                  6
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("7")}>
                  7
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("8")}>
                  8
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("9")}>
                  9
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("00")}>
                  00
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append("0")}>
                  0
                </Button>
              </Grid>
              <Grid size={4}>
                {" "}
                <Button sx={button} fullWidth onClick={() => append(".")}>
                  .
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={3}>
            <Grid size={12}>
              {" "}
              <Button
                fullWidth
                sx={{ p: 3, fontSize: "2rem" }}
                onClick={backspace}
              >
                <Backspace sx={{ fontSize: "2rem" }} />
              </Button>
            </Grid>
            <Grid size={12}>
              {" "}
              <Button sx={button} onClick={() => append("-")} fullWidth>
                -
              </Button>
            </Grid>
            <Grid size={12}>
              {" "}
              <Button sx={button} onClick={() => append("+")} fullWidth>
                +
              </Button>
            </Grid>
            <Grid size={12}>
              {" "}
              <Button sx={button} onClick={onEqual} fullWidth>
                =
              </Button>
            </Grid>
            <Grid size={12}>
              {" "}
              <Button sx={button} onClick={onDone} fullWidth>
                DONE
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Calculator;
