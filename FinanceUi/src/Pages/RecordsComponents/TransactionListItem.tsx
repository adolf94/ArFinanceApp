import { Alert, Grid, ListItem, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { addToTransactions, ensureTransactionAcctData, fetchTransactionById, TRANSACTION } from "../../repositories/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";



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


const RenderListItem = ({ item }) => {
    const navigate = useNavigate();


    return <ListItem onClick={() => navigate("../transactions/" + item.id)}>
        <Grid container>
            <Grid item xs={4} sm={3}>
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
            <Grid item xs={4} sm={5}>
                <Typography sx={{ fontWeight: 600 }} variant="body1">
                    {item.description || ""}
                </Typography>
                {item.type === "transfer"
                    ? item.credit.name + " => " + item.debit.name
                    : item.type === "expense"
                        ? item.credit.name
                        : item.debit.name}
            </Grid>
            <Grid item xs={4} sx={{ textAlign: "right" }}>
                <Typography
                    color={fontColorOnType(item.type)}
                    sx={{ px: 1, fontWeight: 600 }}
                    variant="body1"
                >
                    P{" "}
                    {item.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                    })}
                </Typography>
            </Grid>
        </Grid>
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
                <Grid item xs={12}>
                    <Alert color="warning" onClick={refetch} severity="error" variant="outlined" >

                        <Typography sx={{ px: 1, color: 'red', fontWeight: 'red' }} variant="body1"> Something went wrong here </Typography>

                    </Alert>
                </Grid>
            </Grid>
        </ListItem>
    }
    return Render;
}

const TransactionListItem = ({ item : extItem } : any) => {
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
        <RenderListItem item={item} />
    </ErrorBoundary>
}

export default TransactionListItem;