import { TextField } from "@mui/material";
import numeral from "numeral";
import  { useEffect, useState } from "react";

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
  //@ts-ignore
  const onChange = (evt : React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> ) => {
    if (
  //@ts-ignore
      !/([-0-9,]*\.[0-9]{0,2})*/.test(evt.target.value) &&
  //@ts-ignore
      /\.{2,}/.test(evt.target.value)
    ) {
  //@ts-ignore
      evt.preventDefault();
      return;
    }
  //@ts-ignore
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
      //InputProps={{
      //   endAdornment: <IconButton onClick={() => setSelectProps(prev => ({ ...selectAccountProps, show: true, dest: "amount" }))} ><Calculate /></IconButton>
      //}}
      {...props}
      onKeyUp={(event) => {
        if (!/[-0-9.,]/.test(event.key)) {
          event.preventDefault();
        }
        if ((value + event.key).split("").filter((e) => e === ".").length > 1)
          event.preventDefault();
      }}
      onBlur={(evt) => {
          props.onChange(numeral(value.replace(",", "")).value());
          if (evt.target.value === "") {
              setValue("0.00")
          } else {
              const formatting = numeral((evt.target.value || "0").toString().replace(",", "")).format(
                  "0,0.00",
              )
              console.log(formatting)
              setValue(
                  formatting
              )
          }


      }}
          onFocus={() => {
              if (Number.parseFloat(value) === 0) setValue("");
        }}
      value={value}
      onChange={onChange}
      //value={numeral(formData.amount).format("0,0.00")} onBlur={(e) => setFormData({ ...formData, amount: numeral(e.target.value).value() })}
      //onChange={(e) => setFormData({ ...formData, amount: numeral(e.target.value).value() })}
      //onClick={() => setSelectProps((prev) => ({ ...prev, dest: "amount" }))}
    />
  );
};


export const FormattedAmount = (amount: number) => {


    return numeral((amount || "0")).format(
        "0,0.00",
    )
}

export default NumberInput;
