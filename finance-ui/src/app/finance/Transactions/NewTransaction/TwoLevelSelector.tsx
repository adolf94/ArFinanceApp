import { AppBar, Card, CardHeader, Divider, Grid, List, ListItem, Paper, Typography } from "@mui/material";



function TwoLevelSelector(props:any) : React.ReactElement {


  return <>
    <AppBar position="static">
      <Grid container sx={{p:1} }>
        <Grid>
          <Typography >Asset</Typography>
        </Grid>  
      </Grid>
    </AppBar>
    <Grid container>
      <Grid xs={6}>
        <List dense>
          <ListItem>Test</ListItem>
          <Divider />
          <ListItem>Test</ListItem>
          <Divider />
          <ListItem>Test</ListItem>
          <Divider />

        </List>
      </Grid>
      <Grid xs={6}>
        <List>
          <ListItem>Test</ListItem>
          <ListItem>Test</ListItem>
          <ListItem>Test</ListItem>
        </List>
      </Grid>
    </Grid>
  </>
}

export default TwoLevelSelector