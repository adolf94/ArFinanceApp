import {Box, Tooltip } from "@mui/material";
import {LoanProfile} from "FinanceApi";
import numeral from "numeral";

interface LoanProfileHelperTextProps {
    loanProfile : LoanProfile
    
}

const LoanProfileHelperText = ({loanProfile} : LoanProfileHelperTextProps)=>{
    
    
    
    return loanProfile && <Tooltip disableFocusListener={loanProfile.fixed.length == 0} 
                    disableTouchListener={loanProfile.fixed.length == 0}  
                    disableHoverListener={loanProfile.fixed.length == 0}
                    title={ loanProfile && <>  {loanProfile.fixed.map(e=><Box sx={{display:'block'}}>
                {"<="} {e.maxDays} : {e.interest}%
            </Box>)}</>}
     >
        <span>{loanProfile? 
            `${loanProfile.interestPerMonth}% Monthly of ${loanProfile.interestFactor} ` + (loanProfile.computePerDay? `(${numeral(loanProfile.interestPerMonth * 12 / 36500).format("0.00%")}/day)`:   "")
            : ""}</span>
    </Tooltip>
}

export default LoanProfileHelperText