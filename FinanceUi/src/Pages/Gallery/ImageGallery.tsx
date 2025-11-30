import { AppBar, Box, Chip, Grid2 as Grid, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { BLOB_FILE, getFiles } from "../../repositories/files"
import ImageModal from "../Notifications/ImageModal"
import { Delete, ImageSearch, Spellcheck, TaskAlt } from "@mui/icons-material"
import { useConfirm } from "material-ui-confirm"
import api from "../../components/fnApi"
import ImageDataRow from "./ImageDataRow"


import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
  } from '@tanstack/react-table'
import { BlobFile } from "FinanceApi"
import moment from "moment"
import DeleteButton from "./DeleteButton"
import { useState } from "react"
import EditAiData from "./EditAiData"







  const columnHelper = createColumnHelper<BlobFile>()

  const columns = [
    columnHelper.accessor(row=>row.originalFileName, {
      cell: info =>  <ImageModal id={info.row.original.id}>
                  <Link underline="hover">
                  {info.row.original.originalFileName}
                  {info.row.original.aiReviewed && <TaskAlt color="success" fontSize="0.75rem"/> }
                  </Link>
                  
              </ImageModal>,
      id: "originalFileName",
      header: ()=> <span>Filename</span>
    }),
    columnHelper.accessor(row => row.dateCreated, {
      id: 'dateCreated',
      sortDescFirst: true,
      sortUndefined: 'last', 
      cell: info => <Typography>{moment(info.getValue()).format("MMM DD, HH:mm a")}</Typography>,
      enableSorting:true,
      header: () => <span>Date Added</span>,
    }),
    columnHelper.display( {
        id:"actions",
        header: () => 'Actions',
        cell: (info)=><>
            <EditAiData data={info.row.original.aiData} id={info.row.original.id} setData={()=>{}} reviewed={info.row.original.aiReviewed}/>
            <DeleteButton id={info.row.original.id} />
        </>
    }),
    // columnHelper.accessor('visits', {
    //   header: () => <span>Visits</span>,
    //   footer: info => info.column.id,
    // }),
    // columnHelper.accessor('status', {
    //   header: 'Status',
    //   footer: info => info.column.id,
    // }),
    // columnHelper.accessor('progress', {
    //   header: 'Profile Progress',
    //   footer: info => info.column.id,
    // }),
  ]
  



const ImageGallery = ()=>{
    const confirm = useConfirm()
    const {data, isLoading} = useQuery({
        queryKey:[BLOB_FILE],
        queryFn: ()=>getFiles()
    })


    const [sorting, setSorting] = useState<SortingState>([
        {id:"dateCreated", desc:true}
    ])

    const table = useReactTable({
        data: (data || []),
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting, 
        state: {
            sorting,
        },
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
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <TableCell key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                                ? null
                                : <Box
                                onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                    
                                    {{
                                    asc: ' 🔼',
                                    desc: ' 🔽',
                                    }[header.column.getIsSorted() as string] ?? null}
                                </Box>
                            }
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableHead>
                    <TableBody>
                    {table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
    </>
}

export default ImageGallery