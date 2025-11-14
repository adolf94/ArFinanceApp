import { Autocomplete, createFilterOptions, TextField } from "@mui/material"
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { values } from "underscore";
import { GetAllTags, TAG, useMutateTags } from "../../repositories/tags";
import { Tag } from "FinanceApi";
import useDexieDataWithQuery from "../../components/LocalDb/useOfflineData2";
import db from "../../components/LocalDb/AppDb";
import { MakeOptional } from "@mui/x-date-pickers/internals";


const filter = createFilterOptions<Tag & {new?: boolean}>();


const SelectTagField = ({onAdd} : {onAdd: (data)=>any})=>{
    const [internalValue,setValue] = useState(null)
    const [inputValue,setInputValue] = useState("")
    const mutateTag = useMutateTags()

    const {data: options, reload, isLoading} = useDexieDataWithQuery<Tag[]>({
        queryParams: {
            queryKey:[TAG],
            queryFn: ()=>GetAllTags()
        },
        dexieData: ()=>db.tags.toArray(),
        dataToDbFunction: (data)=>db.tags.bulkPut(data)
    },[])

    const createTag = (value)=>{
        mutateTag.create.mutateAsync(value)
            .then(()=>{
                onAdd(value)
                reload()
            })

    }

    const onChange = (_,newValue)=>{

        if (typeof newValue === "string") {
            createTag(newValue);
        } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            createTag(newValue.inputValue);
        } else if (newValue.new) {
            createTag(newValue.inputValue);
        }
         else {
            onAdd(newValue.value);
        }
        setValue(null)
        
    }

    return <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options || []} 
        getOptionKey={e=>e.value}
        getOptionLabel={e=>e.value}
        value={null}
        inputValue={inputValue}
        onInputChange={(evt)=>{
            setInputValue(evt?.target?.value || "")
        }}
        filterOptions={(options, params) => {
            const filtered = filter(options, params)
                .sort((a,b)=>b.count-a.count);
                    
            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some(
                (option) => inputValue === option.value,
            );
            if (inputValue !== "" && !isExisting) {
                filtered.push({
                    new:true,
                    inputValue: inputValue,
                    value: `Add "${inputValue}"`,
                });
            }

            return filtered;
        }}
        onChange={onChange}
        
        renderInput={(params) => <TextField 
        
        {...params}
        onFocus={()=>{
            setInputValue("")
        }}
        // onBlur={(evt)=>{
        //     let filtered = filter(vendors, {inputValue:evt.target.value, getOptionLabel:(e: any) => e.name} )
        //                     .filter(e=>!e.new)
        //     let count = filtered.filter(e=>!e.new).length
        //     if(evt.target.value != "" && !creating.current && filtered.length == 1){
        //         props.onChange(filtered[0]);
        //     }
        //     return params.onBlur && params.onBlur(evt)
        // }}
        value="" 
        variant="standard" />}
    />
}


export default SelectTagField