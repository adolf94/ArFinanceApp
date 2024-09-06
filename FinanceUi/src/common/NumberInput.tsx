import { TextField, TextFieldProps, TextFieldVariants } from "@mui/material";
import numeral from "numeral";
import React, { useEffect, useState } from "react";

const NumberInput = (props: any) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!/([0-9\.])*/.test(props.value) && /\.{2,}/.test(props.value)) {
      return;
    }
    setValue(
      numeral((props.value || "0").toString().replace(",", "")).format(
        "0,0.00",
      ),
    );
  }, [props.value]);

  const onChange = (evt) => {
    if (
      !/([0-9,]*\.[0-9]{0,2})*/.test(evt.target.value) &&
      /\.{2,}/.test(evt.target.value)
    ) {
      evt.preventDefault();
      return;
    }
    setValue(evt.target.value);
  };

  return (
    <TextField
      inputProps={{
        min: 0,
        style: { textAlign: "right" },
        ...props.inputProps,
      }}
      fullWidth
      variant="standard"
      //InputProps={{
      //   endAdornment: <IconButton onClick={() => setSelectProps(prev => ({ ...selectAccountProps, show: true, dest: "amount" }))} ><Calculate /></IconButton>
      //}}
      {...props}
      onKeyPress={(event) => {
        if (!/[0-9\.,]/.test(event.key)) {
          event.preventDefault();
        }
        if ((value + event.key).split("").filter((e) => e == ".").length > 1)
          event.preventDefault();
      }}
      onBlur={() => {
        props.onChange(numeral(value.replace(",", "")).value());
      }}
      value={value}
      onChange={onChange}
      //value={numeral(formData.amount).format("0,0.00")} onBlur={(e) => setFormData({ ...formData, amount: numeral(e.target.value).value() })}
      //onChange={(e) => setFormData({ ...formData, amount: numeral(e.target.value).value() })}
      //onClick={() => setSelectProps((prev) => ({ ...prev, dest: "amount" }))}
    />
  );
};

export default NumberInput;
