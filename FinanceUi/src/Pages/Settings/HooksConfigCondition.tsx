import { Edit } from "@mui/icons-material"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"



const HooksConfigCondition = ({item})=>{


    return <ListItem dense disablePadding
            secondaryAction={
                <IconButton >
                    <Edit/>
                </IconButton>}
        
        >
            <ListItemText>
                <Typography variant="body2">{item.property} <i>{item.operation}</i> <b>"{item.value}"</b> </Typography>
            </ListItemText>
        </ListItem>
}

export default HooksConfigCondition