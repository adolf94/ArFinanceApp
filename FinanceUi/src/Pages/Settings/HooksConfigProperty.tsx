import { Edit } from "@mui/icons-material"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"



const HooksConfigProperty = ({item})=>{



    return  <ListItem dense disablePadding
        // secondaryAction={
        //     <IconButton>
        //         <Edit/>
        //     </IconButton>}
    
    >

        <ListItemText>
            <Typography variant="body2"> {item.property} <b>({item.regexIndex})</b></Typography>
        </ListItemText>
    </ListItem>
}

export default HooksConfigProperty 