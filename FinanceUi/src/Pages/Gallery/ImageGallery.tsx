import { AppBar, Grid2 as Grid, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { BLOB_FILE, getFiles } from "../../repositories/files"
import ImageModal from "../Notifications/ImageModal"
import { Delete } from "@mui/icons-material"
import { useConfirm } from "material-ui-confirm"
import api from "../../components/fnApi"
import ImageDataRow from "./ImageDataRow"



const ImageGallery = ()=>{
    const confirm = useConfirm()
    const {data, isLoading} = useQuery({
        queryKey:[BLOB_FILE],
        queryFn: ()=>getFiles()
    })

    const deleteImage = (id)=>{
        // confirm({
        //     description: "Delete Permanently"
        // }).then((rep)=>{


        // })
        api(`file/${id}/hookmessages`)
            .then(e=>console.log(e.data))
    }


    return <>
    <AppBar position="static">
        <Toolbar>
            <Typography sx={{ flexGrow: 1 }} variant="h5" component="div">
                Images
            </Typography>
        </Toolbar>
    </AppBar>
    <Grid container sx={{width:"100%", justifyContent:"center"}}>
        <Grid size={{xs:12,md:8}}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                            </TableCell>
                            <TableCell>
                                Filename
                            </TableCell>
                            <TableCell>
                                App
                            </TableCell>
                            <TableCell>
                                
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            (data || []).map(opt=><ImageDataRow item={opt} />)
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
    </>
}

export default ImageGallery