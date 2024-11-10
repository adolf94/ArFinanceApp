
import moment from "moment"
import {useRef, useState } from "react"
import { DatePicker } from "@mui/x-date-pickers"
import { TextField } from "@mui/material"


const DatePickerWithBlur = (props: any) => {
    const refValue = useRef(moment())
    const [selectedDate, setSelectedDate] = useState(refValue.current);
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
    console.log(selectedDate);
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
                                    onBlur={handleBlur}
                                />)
                        }}/> 
}


export default DatePickerWithBlur