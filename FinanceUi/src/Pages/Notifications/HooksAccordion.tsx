import { ArrowDownward, ArrowDropDown } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Grid, TableCell, TableContainer, TableBody, Table, TableRow, Typography } from "@mui/material"


const HooksAccordion = ({notif }) => {



    return <>
        <Accordion>
            <AccordionSummary
                expandIcon={<ArrowDownward />}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                    <Typography component="span">{ notif.rawMsg}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>Rule</TableCell>
                            <TableCell>{notif.matchedConfig}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </AccordionDetails>
        </Accordion>
        </>
}


export default HooksAccordion