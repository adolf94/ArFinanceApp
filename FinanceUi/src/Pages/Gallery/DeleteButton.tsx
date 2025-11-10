import { Delete } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useLiveQuery } from "dexie-react-hooks"
import { useConfirm } from "material-ui-confirm"
import { useState } from "react"
import db from "../../components/LocalDb"
import { useMutateBlobFile } from "../../repositories/files"
import api from "../../components/fnApi"


const DeleteButton = ({id})=>{

    const [hasN, setHasN] = useState(false)
    const confirm = useConfirm()
    const hasNotif = useLiveQuery(()=>db.hookMessages.where("jsonData.imageId").equals(id).first()
                        ,[id, hasN])
    const mutateFile = useMutateBlobFile()
    const deleteImage = ()=>{
            return api(`file/${id}/hookmessages`)
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

    return <IconButton disabled={disableButton} onClick={()=>deleteImage()}>
        <Delete />
    </IconButton>
}


export default DeleteButton