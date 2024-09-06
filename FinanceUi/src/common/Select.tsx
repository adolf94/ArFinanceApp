import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  SelectChangeEvent,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";

interface SelectProps<T> {
  options: T[];
  value?: T | T[] | null;
  getOptionValue: (opt: T) => string;
  getOptionLabel: (opt: T) => string;
  multiple?: boolean;
  size?: "small" | "medium";
  label?: string;
  onChange: (newValue: T | T[]) => void;
  helperText?: string;
  fullWidth?: boolean;
}

function Select<T>(props: SelectProps<T>) {
  if (props.multiple) {
    props.value = props.value as T[];
    props.onChange = props.onChange as (newValue: T | T[]) => void;
  }

  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  useEffect(() => {
    if (props.multiple) {
      setSelected((props.value as T[]).map((e) => props.getOptionValue(e)));
    } else {
      if (!props.value) {
        setSelected([]);
      } else {
        setSelected([props.getOptionValue(props.value as T)]);
      }
    }
  }, [props.value]);

  const getValue = () => {
    if (!props.value) return "";

    if (props.multiple) {
      return props.options
        .filter((e) => selected.indexOf(props.getOptionValue(e)) !== -1)
        .map((e) => props.getOptionLabel(e))
        .join(", ");
    } else {
      return props.getOptionValue(props.value as T);
    }
  };

  const internalOnchange = (key: string) => {
    const index = selected.indexOf(key);
    let newValue = [...selected];
    if (index === -1) newValue = [...selected, key];
    if (index > -1 && props.multiple) {
      newValue.splice(index, 1);
    } else {
      newValue = [key];
    }
    //setSelected([...newValue])

    const outwardValue = props.multiple
      ? props.options.filter(
          (opt) => newValue.indexOf(props.getOptionValue(opt)) != -1,
        )
      : props.options.find(
          (opt) => newValue.indexOf(props.getOptionValue(opt)) != -1,
        );

    props.onChange(outwardValue);
  };

  const getStyles = (name: string, theme: Theme) => {
    return {
      fontWeight:
        selected.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  };

  return (
    <FormControl fullWidth={props.fullWidth}>
      {props.label && (
        <InputLabel sx={{ backgroundColor: "white", px: 1 }}>
          <Typography sx={{ px: 1 }}> {props.label}</Typography>
        </InputLabel>
      )}
      <MuiSelect
        value={getValue()}
        size={props.size}
        renderValue={() => {
          if (!props.multiple)
            return (
              <Typography fontSize={props.size}>
                {props.getOptionLabel(props.value as T)}
              </Typography>
            );

          return props.options
            .filter((e) => selected.indexOf(props.getOptionValue(e)) !== -1)
            .map((e) => (
              <Chip
                key={props.getOptionValue(e)}
                size="small"
                label={props.getOptionLabel(e)}
              ></Chip>
            ));
        }}
      >
        {props.options.map((opt) => (
          <MenuItem
            value={props.getOptionValue(opt)}
            onClick={() => internalOnchange(props.getOptionValue(opt))}
            style={getStyles(props.getOptionValue(opt), theme)}
          >
            {props.getOptionLabel(opt)}
          </MenuItem>
        ))}
      </MuiSelect>
      {!!props.helperText && (
        <FormHelperText>{props.helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export default Select;
