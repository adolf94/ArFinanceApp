import { Autocomplete } from "@mui/material"
import { useEffect } from "react"




interface MuiDropdownProps<T>{

		options: T[],
		getOptionKey: (opt: T) => string,
		getOptionLabel: (opt: T) => string,

		multiple: false,
		value: T | null,

}

interface MuiDropdownPropsMultiple<T> extends Omit<MuiDropdownProps<T>, 'multiple' | 'value'> {

		value: T[],
		multiple: true,


}



const AutocompleteDropdown = <T,>(props: MuiDropdownPropsMultiple<T> | MuiDropdownProps<T>) => {



		useEffect(() =>{

		},[])
		11
		return	<Autocomplete
				value={props.value}
        onChange={(event: any, newValue) => {
          props.onChange(newValue);
				}}


				/>


}


export default AutocompleteDropdown