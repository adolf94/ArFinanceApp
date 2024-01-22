import { Backspace, Close } from "@mui/icons-material"
import { Box, Button, Grid, IconButton, Paper, SxProps, TextField } from "@mui/material"
import React, { useState } from "react"
import { evaluate } from 'mathjs'
import { useEffect } from "react"


const button : SxProps = {
  p: 2, fontSize: 'x-large'
}


const Calculator = (props) => {
  const [formula,setFormula] = useState("")
  const [result, setResult] = useState("")
  const [equalClicked, setEqualClicked] = useState(false)

  useEffect(() => {
    setResult(props.value)
  }, [props.value])

  const append = (val) => {
    let newFormula 

    
    if (equalClicked) {
      if (Number.isNaN(Number.parseInt(val))) {
        newFormula = result + val
      } else {
        newFormula = val
      }
    } else {
      newFormula = formula + val
    }
    setFormula(newFormula)
    evalu(newFormula)
    setEqualClicked(false)

  }

  const backspace = () => {
    let newFormula = formula.substring(0, formula.length - 1)
    setFormula(newFormula)
    evalu(newFormula)
    setEqualClicked(false)
  }


  const evalu = (newFormula) => {

    let newResult
    try {
      newResult = evaluate(newFormula)
      setResult(newResult)
    } catch (ex) {
    }
  }

  const onEqual = () => {
    evalu(formula)
    setEqualClicked(true)
  }

  const onDone = () => {
    props.onChange(result)
    props.onClose()
  }

  return <>

    <Box>
      <Grid container sx={{ px: 1, pt: 1 }}>
        <Grid item xs={12}>
          <Grid container sx={{ display: 'flex', justifyContent: 'end' }}>
            <Grid item sx={{ flexShrink: 1 }} ><IconButton onClick={() => props.onClose()}><Close /></IconButton></Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="standard"
            fullWidth
            value={formula}
            />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant="standard"
            fullWidth
            sx={{ fontSize: 'large', py:1 }}
            inputProps={{
              sx: {fontSize: 'large', textAlign:'right'}
            }}
            value={result}
          />
        </Grid>
      </Grid>
      <Grid container>
        <Grid xs={9}>
          <Grid container>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => setFormula("")}>AC</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("/")}>/</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("*")}>x</Button></Grid>
            <Grid xs={4} > <Button sx={button} fullWidth onClick={() => append("1")}>1</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("2")}>2</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("3")}>3</Button></Grid>
            <Grid xs={4} > <Button sx={button} fullWidth onClick={() => append("4")}>4</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("5")}>5</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("6")}>6</Button></Grid>
            <Grid xs={4} > <Button sx={button} fullWidth onClick={() => append("7")}>7</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("8")}>8</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("9")}>9</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("00")}>00</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append("0")}>0</Button></Grid>
            <Grid xs={4}> <Button sx={button} fullWidth onClick={() => append(".")}>.</Button></Grid>
          </Grid>
        </Grid>
        <Grid xs={3}>

          <Grid xs={12} > <Button fullWidth sx={{ p: 3, fontSize: '2rem' }} onClick={backspace} ><Backspace sx={{ fontSize:'2rem' }}  /></Button></Grid>
          <Grid xs={12}> <Button sx={button} onClick={() => append("-")} fullWidth>-</Button></Grid>
          <Grid xs={12}> <Button sx={button} onClick={() => append("+")} fullWidth>+</Button></Grid>
          <Grid xs={12}> <Button sx={button} onClick={onEqual}  fullWidth>=</Button></Grid>
          <Grid xs={12}> <Button sx={button} onClick={onDone} fullWidth>DONE</Button></Grid>

        </Grid>
      </Grid>
    </Box>
  </>
}

export default Calculator