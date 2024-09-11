import { Autocomplete, Box, createFilterOptions, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState } from "react";
import {v4 as uuid } from 'uuid'
import { fetchVendors, useMutateVendor, VENDOR } from "../../repositories/vendors";
import { useParams } from "react-router-dom";
import { SelectAccountContext } from "../NewRecord";


const filter = createFilterOptions();

const VendorTextField = (props) => {
    const [internalValue, setInternalValue] = useState("");
    const [focused, setFocused] = useState(false);
    const { data: vendors } = useQuery({
        queryKey: [VENDOR],
        queryFn: fetchVendors,
    });
    const mutateVendor = useMutateVendor();
    const view = useContext<any>(SelectAccountContext);
    const { transId } = useParams();

    const onTyped = (e) => {
        setInternalValue(e);
        props.onSearchChange(e);
    };

    const displayValue = () => {
        if (focused) {
            return internalValue || "";
        } else {
            return props.value?.name || "";
        }
    };

    const createNewVendor = (newVendor) => {
        mutateVendor
            .create({
                id: uuid(),
                name: newVendor,
                enabled: true,
            })
            .then((e) => {
                props.onChange(e);
            });
    };

    return (
        <>
            <Box sx={{ display: { lg: "block", xs: "none" } }}>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={vendors || []}
                    fullWidth
                    getOptionLabel={(e) => e.name}
                    getOptionKey={(e) => e.id}
                    value={props.value}
                    filterOptions={(options, params) => {
                        const filtered = filter(options, params);

                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        const isExisting = options.some(
                            (option) => inputValue === option.title,
                        );
                        if (inputValue !== "" && !isExisting) {
                            filtered.push({
                                id: uuid(),
                                new:true,
                                inputValue: inputValue,
                                name: `Add "${inputValue}"`,
                            });
                        }

                        return filtered;
                    }}
                    onOpen={props.onClick}
                    onChange={(event, newValue) => {
                        if (typeof newValue === "string") {
                            createNewVendor(newValue);
                        } else if (newValue && newValue.inputValue) {
                            // Create a new value from the user input
                            createNewVendor(newValue.inputValue);
                        } else if (newValue.new) {
                            createNewVendor(newValue.inputValue);
                        }
                         else {
                            props.onChange(newValue);
                        }
                    }}
                    renderInput={(params) => <TextField {...params} variant="standard" />}
                />
            </Box>
            <Box sx={{ display: { sx: "block", lg: "none" } }}>
                <TextField
                    fullWidth
                    {...props}
                    placeholder={
                        view.type === "vendor"
                            ? view.searchValue || props.value?.name
                            : props.value?.name || ""
                    }
                    value={displayValue()}
                    variant="standard"
                    onFocus={() => {
                        setFocused(true);
                        setInternalValue("");
                    }}
                    onBlur={() => {
                        setFocused(false);
                    }}
                    onChange={(e) => onTyped(e.target.value)}
                    sx={{ input: { color: "black" }, label: { color: "black" } }}
                />
            </Box>
        </>
    );

}


 export default VendorTextField