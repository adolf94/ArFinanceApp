import {Box, CardContent, FormControl, Grid2 as Grid, InputLabel,  Paper, Typography, Select, MenuItem, Button, IconButton, CircularProgress } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import moment from "moment";
import {getLedgerEntries, getLedgerEntriesBy, LEDGER_ENTRY} from "../../../repositories/ledgerEntries";
import AccountName from "./AccountName";
import {FormattedAmount} from "../../../components/NumberInput";
import { useState } from "react";
import {AddTask, FilterList, Event } from "@mui/icons-material";


const dates = Array.from(Array(12).keys()).map(key=>{
    return {
        value: moment([moment().year(), key, 1]).format("YYYY-MM"),
        label: moment([moment().year(), key, 1]).format("MMM")
    }
})

const JournalEntries = ()=>{
    
    const [month, setMonth] = useState(moment().format("YYYY-MM"))
    const [filterBy, setFilterBy] = useState("dateAdded")
    const {data:entries, isLoading} = useQuery({queryKey:[LEDGER_ENTRY, {by:filterBy, month }], queryFn:()=>getLedgerEntriesBy(filterBy,month)});
    
    return <Grid container>
        <Grid size={12} sx={{px:{sm:0,md:1}}}>
            <Paper>
                <CardContent>
                    <Grid container padding={2} justifyContent="end">
                        <Grid  sx={{px:2}}>
                            <Button size="small" variant={filterBy=="dateAdded"?"outlined":"contained"} onClick={()=>setFilterBy("eventDate")}><Event /></Button>
                            <Button size="small" variant={filterBy=="dateAdded"?"contained":"outlined"} onClick={()=>setFilterBy("dateAdded")}><AddTask /></Button>
                            {/*<Button size="sm">Date</Button>*/}
                            {/*<Button size="sm">Date Post</Button>*/}
                        </Grid>
                        <Grid >
                            <FormControl >
                                <InputLabel id="demo-simple-select-label">Year</InputLabel>
                                <Select
                                    value={month}
                                    label="Month"
                                    size="small"
                                    onChange={(evt) => setMonth(evt.target.value)}
                                >
                                    {dates.map(e => <MenuItem value={e.value}>{e.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container sx={{display:{md:'flex',xs:"none"}}}>
                        <Grid size={2}>Date</Grid>
                        <Grid size={4}>From(Credit)</Grid>
                        <Grid size={4}>To(Debit)</Grid>
                        <Grid size={2}>Amount</Grid>
                    </Grid>
                    {isLoading && <Grid sx={{pt:3}} container justifyContent="center">
                        <Grid size={2}>
                            <CircularProgress />
                        </Grid>
                        
                    </Grid>}
                    {(entries||[]).map(e=><><Grid container sx={{pt:1}}>
                        <Grid size={{xs:12, md:2}}>
                            <Typography variant="body1">{moment(e.date).format("YYYY-MM-DD")}</Typography>
                        </Grid>
                        <Grid size={{xs:8, md:4}}>
                            <Typography variant="body1">
                                <AccountName id={e.creditId} />
                            </Typography>
                        </Grid>
                        <Grid size={{xs:4}} sx={{display:{xs:"block", md:"none"},textAlign:"right"}}>
                            <Typography variant="body1">
                                    {FormattedAmount(e.amount)}
                            </Typography>
                        </Grid>
                        <Grid offset={{xs:1,md:0}} size={{xs:8,md:4}}>
                            <Typography variant="body1">
                                <AccountName id={e.debitId} />
                            </Typography>
                        </Grid>
                        <Grid size={2} sx={{textAlign:'right', display:{xs:'none', md:'block'}}}>
                            <Typography variant="body1">
                                {FormattedAmount(e.amount)}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container sx={{pb:1}}>
                        <Grid offset={2}>
                            <Typography variant="body1" sx={{color:'#9f9f9f', fontStyle:'italic'}}>{e.description}</Typography>
                        </Grid>
                    </Grid>
                    </>)}
                </CardContent>
            </Paper>
        </Grid>
    </Grid>
}
export default JournalEntries