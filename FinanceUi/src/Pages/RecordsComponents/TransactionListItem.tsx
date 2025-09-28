import { Alert, Box, Grid2 as Grid, ListItem, Skeleton, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { addToTransactions, ensureTransactionAcctData, fetchTransactionById, TRANSACTION } from "../../repositories/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import numeral from "numeral";
import { EventNote } from "@mui/icons-material";



const fontColorOnType = (type) => {
    switch (type) {
        case "expense":
            return "error.light";
        case "income":
            return "success.light";
        case "transfer":
            return "primary.light";
    }
};


const LoadingListItem = () => {

    return <ListItem>
        <Grid container>
            <Grid size={{xs:4, sm:3}}>
                <Typography sx={{ px: 1 }} variant="body1">
                    <Skeleton variant="text" width="4rem" />
                </Typography>
                <Typography sx={{ px: 1 }} variant="body1">
                    <Skeleton variant="text" width="7rem" />
                </Typography>
            </Grid>
            <Grid size={{xs:4, sm:5}}>
                <Skeleton variant="text" width="7rem" />
            </Grid>
            <Grid size={4} sx={{ alignItems: "end" }}>
                    <Skeleton variant="text" width="4rem" />

            </Grid>
        </Grid>
    </ListItem>

}

const RenderListItem = ({ item }) => {
    const navigate = useNavigate();


    return <ListItem onClick={() => navigate("../transactions/" + item.id)}>
        <Box width="100%">
            <Grid container sx={{display:{xs:'none', sm:'flex'}}}>
                <Grid size={{xs:4, sm:3}}>
                    <Typography sx={{ px: 1 }} variant="body1">
                        {item.type === "transfer"
                            ? "Transfer"
                            : item.type === "expense"
                                ? item.debit.name
                                : item.credit.name}
                    </Typography>
                    <Typography sx={{ px: 1 }} variant="body1">
                        {item.vendor?.name}
                    </Typography>
                </Grid>
                <Grid container size={{xs:4, sm:5}} sx={{ justifyContent: "start",}}>
                    <Grid >
                            {item.scheduleId && 
                                <EventNote fontSize="small" />
                            
                            } 
                    </Grid>
                    <Grid sx={{flexGrow:1,  pl:1}}>
                        <Typography sx={{ fontWeight: 600 }} variant="body1">
                            {item.description || ""}
                        </Typography>
                        <Typography variant="body1">

                        {item.type === "transfer"
                            ? item.credit.name + " => " + item.debit.name
                            : item.type === "expense"
                                ? item.credit.name
                                : item.debit.name}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid size={4} sx={{ textAlign: "right" }}>
                    
                <Typography
                        color={fontColorOnType(item.type)}
                        sx={{ px: 1, fontWeight: 600 }}
                        variant="body1"
                    >
                        {numeral(item.amount).format("P 0,0.00")}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container sx={{display:{sm:'none'}}}>
               <Grid container size={9}>
                    <Grid size={6}>
                        <Typography variant="body1">
                            {item.type === "transfer"
                                ? "Transfer"
                                : item.type === "expense"
                                    ? item.debit.name
                                    : item.credit.name}
                        </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="body1">

                            {item.type === "transfer"
                                ? item.credit.name + " => " + item.debit.name
                                : item.type === "expense"
                                    ? item.credit.name
                                    : item.debit.name}
                        </Typography>
                    </Grid>
                    <Grid size={12}>
                            
                        <Typography sx={{ fontWeight: 600 }} variant="body1">
                            {item.description || ""}
                        </Typography>
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="body1">
                            {item.vendor?.name}
                        </Typography>
                    </Grid>
               </Grid>
               <Grid size={3}>
                    <Typography
                        color={fontColorOnType(item.type)}
                        sx={{ px: 1, fontWeight: 600 }}
                        variant="body1"
                    >
                        {numeral(item.amount).format("P 0,0.00")}
                    </Typography>
               </Grid>
            </Grid>
        </Box>
    </ListItem>
}


const FallbackListItem = (itemId) => {
    const Render = ({ error, resetErrorBoundary }) => {
        const queryClient = useQueryClient()

        const refetch = async () => {
            let trans = await queryClient.ensureQueryData({
                queryKey: [TRANSACTION, { id: itemId }],
                queryFn: () => fetchTransactionById(itemId)
            })
            trans = await ensureTransactionAcctData(trans)
            addToTransactions(trans, true)
            resetErrorBoundary(trans)
        }

        return <ListItem>
            <Grid container >
                <Grid xs={12}>
                    <Alert color="warning" onClick={refetch} severity="error" variant="outlined" >

                        <Typography sx={{ px: 1, color: 'red', fontWeight: 'red' }} variant="body1"> Something went wrong here </Typography>

                    </Alert>
                </Grid>
            </Grid>
        </ListItem>
    }
    return Render;
}

const TransactionListItem = ({ item : extItem, loading } : any) => {
    const [item, setItem] = useState(extItem)

    useEffect(() => {
        setItem(extItem)
    },[extItem])


    return <ErrorBoundary FallbackComponent={FallbackListItem(item.id)} key={item.id} onError={(data) => {
        console.debug(data)
        enqueueSnackbar("Something happened on the listItem Record", { variant: 'warning' })
    }} onReset={(trans) => {
            setItem(trans.args[0])
    }}>
        {loading ? <LoadingListItem /> : <RenderListItem item={item} />}
    </ErrorBoundary>
}

export default TransactionListItem;