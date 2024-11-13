
import moment from "moment"
import {useEffect, useRef, useState } from "react"
import { DatePicker } from "@mui/x-date-pickers"
import { DatePickerProps } from "@mui/x-date-pickers/DatePicker"
import { TextField } from "@mui/material"


const DatePickerWithBlur  = (props:any & {value: moment.Moment}) => {
    const refValue = useRef(moment())
    const [selectedDate, setSelectedDate] = useState(props.value);


    useEffect(() => {
        setSelectedDate(props.value);
    }, [props.value]);
    const handleDateChange = (date : moment.Moment) => {
            // setSelectedDate(date);
        // setSelectedDate(date)
        refValue.current = date;
    };
    
    
 
    const handleBlur = () => {
        setSelectedDate(refValue.current)
        props.onChange(refValue.current)
    };

    const handleAccept = (newValue : moment.Moment)=>{
        setSelectedDate(newValue)
        props.onChange(newValue)
    }
    return  <DatePicker label="Date of Loan"
                        {...props}
                        value={selectedDate}
                        defaultValue={selectedDate}
                        onChange={handleDateChange}
                        onAccept={handleAccept}
                        slots={{
                            textField: (params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    onBlur={handleBlur}
                                />)
                        }}/> 
}


export default DatePickerWithBlur