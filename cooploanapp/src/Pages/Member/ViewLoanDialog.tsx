import { Dialog, DialogContent } from "@mui/material"
import { useNavigate } from "react-router-dom";
import ViewLoanDetails from "../Admin/Loan/ViewLoanDetails";


const ViewLoanDialog = ()=>{
    const navigate = useNavigate()
    return <>
        <Dialog maxWidth="md" open onClose={()=>navigate(-1)}>
            <DialogContent>
                <ViewLoanDetails />
            </DialogContent>
            
        </Dialog>
     
    </>
}

export default ViewLoanDialog;