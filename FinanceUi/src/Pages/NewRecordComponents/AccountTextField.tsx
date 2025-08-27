import { InputAdornment, TextField } from "@mui/material"
import { Account } from "FinanceApi"
import numeral from "numeral"

interface AccountTextField {
    type: string,
    debitOn: string[],
    creditOn: string[],
    debit?:Account & {type:string},
    credit?:Account & {type:string},
    onFocus:React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>

    showReference:boolean,
    hookReference?:any
}

const AccountTextField = (props:AccountTextField)=> {


    const accountToShow = props.creditOn.includes(props.type) ? props.credit : props.debit
    const showAdornment = accountToShow && ["892f20e5-b8dc-42b6-10c9-08dabb20ff77"].includes(accountToShow.type!)

    return <TextField
                    autoComplete="off"
                    fullWidth
                    variant="standard"
                    value={
                        accountToShow?.name || ""
                    }
                    onFocus={props.onFocus}
    
                    slotProps={{
                      input:{
                        endAdornment: showAdornment && <InputAdornment position="end">
                          {numeral( accountToShow.balance).format("0,0.00")}
                        </InputAdornment>
                      }
                    }}
                    
                    helperText={props.showReference? props.creditOn.includes(props.type)
                      ? props.hookReference?.credit 
                      :props.hookReference?.debit : ""} 
                  />
}

export default AccountTextField