import { IconButton, Link, TableCell, TableRow } from "@mui/material"
import ImageModal from "../Notifications/ImageModal"
import { Delete } from "@mui/icons-material"
import api from "../../components/fnApi"
import { useLiveQuery } from "dexie-react-hooks"
import db from "../../components/LocalDb"
import { useState } from "react"
import { useConfirm } from "material-ui-confirm"
import { useMutateBlobFile } from "../../repositories/files"



const ImageDataRow = ({item, onDelete})=>{
    const [hasN, setHasN] = useState(false)
    const confirm = useConfirm()
    const hasNotif = useLiveQuery(()=>db.hookMessages.where("jsonData.imageId").equals(item.id).first()
                        ,[item.id, hasN])

    const mutateFile = useMutateBlobFile()
    const deleteImage = (id)=>{
            return api(`file/${item.id}/hookmessages`)
                .then(e=>{
                    if(e.data.count > 0){
                        db.hookMessages.bulkPut(e.data)
                        setHasN(true)
                    }else{
                                        
                        confirm({
                            description: "Delete Permanently",
                            cancellationText: "Keep",
                            cancellationButtonProps:{
                                variant:"contained"
                            },
                            confirmationText: "Delete",
                            confirmationButtonProps: {
                                color: "error",
                                variant:"outlined"
                            }
                        }).then(()=>{
                            mutateFile.del.mutateAsync(id)
                        })
                    }
                })
    }

    const disableButton = hasN || !!hasNotif
                    
    return <TableRow>
    <TableCell>
    </TableCell>
    <TableCell>
        <ImageModal id={item.id}>
            <Link underline="hover">{item.originalFileName}</Link>
        </ImageModal>
    </TableCell>    
    <TableCell>{item.dateCreated}</TableCell>
    <TableCell>
        <IconButton disabled={disableButton} onClick={()=>deleteImage(item.id)}>
            <Delete />
        </IconButton>
    </TableCell>
</TableRow>
}


export default ImageDataRow