import { Edit } from "@mui/icons-material"
import { IconButton, ListItem, ListItemText, Typography } from "@mui/material"
import { useHooksSettingsState } from "./Hooks"



const HooksConfigCondition = ({item})=>{
    const tabState = useHooksSettingsState()

    return tabState.tab != "img_" ? <ListItem dense disablePadding
            secondaryAction={
                <IconButton >
                    <Edit/>
                </IconButton>}
        
        >
            <ListItemText>
                <Typography variant="body2">{item.property} <i>{item.operation}</i> <b>"{item.value}"</b> </Typography>
            </ListItemText>
        </ListItem>:<>
        {Object.keys(item).map((it)=>
        item[it] != null &&        
        <ListItem dense disablePadding
            secondaryAction={
                <IconButton >
                    <Edit/>
                </IconButton>}
        
        >
            <ListItemText>
                <Typography variant="body2">Image <i>{it}</i> <b>"{item[it]}"</b> </Typography>
            </ListItemText>
        </ListItem>)}
        
        
        </>
}

export default HooksConfigCondition