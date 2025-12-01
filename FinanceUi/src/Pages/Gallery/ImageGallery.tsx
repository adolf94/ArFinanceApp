import { AppBar, Box, Chip, Grid2 as Grid, Icon, IconButton, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import { BLOB_FILE, getFiles } from "../../repositories/files"
import ImageModal from "../Notifications/ImageModal"
import { AutoAwesome, ChevronLeft, ChevronRight, Delete, ImageSearch, Spellcheck, TaskAlt } from "@mui/icons-material"
import { useConfirm } from "material-ui-confirm"
import api from "../../components/fnApi"
import ImageDataRow from "./ImageDataRow"


import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
  } from '@tanstack/react-table'
import { BlobFile } from "FinanceApi"
import moment from "moment"
import DeleteButton from "./DeleteButton"
import { useState } from "react"
import EditAiData from "./EditAiData"
import ActionsCell from "./ActionsCell"







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
        cell: (info)=><ActionsCell row={info.row.original} />
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

    
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 12,
    })


    const [sorting, setSorting] = useState<SortingState>([
        {id:"dateCreated", desc:true}
    ])

    const table = useReactTable({
        data: (data || []),
        getRowId:(row)=>row.id,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting, 
        autoResetPageIndex: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination
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
                <Table size="small">
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
            <Box>
                <IconButton 
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}>
                    <ChevronLeft />
                </IconButton>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount().toLocaleString()}
                <IconButton
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}>
                    <ChevronRight />
                </IconButton>
            </Box>
        </Grid>

    </Grid>
    </>
}

export default ImageGallery