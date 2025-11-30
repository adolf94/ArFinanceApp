import { IconButton } from "@mui/material"
import DeleteButton from "./DeleteButton"
import { AutoAwesome } from "@mui/icons-material"
import api from "../../components/fnApi"
import EditAiData from "./EditAiData"
import { useMutateBlobFile } from "../../repositories/files"
import { useConfirm } from "material-ui-confirm"
import { useState } from "react"
import BackdropLoader from "../../components/BackdropLoader"



const ActionsCell = ({row})=>{
    const mutate = useMutateBlobFile(row.id)
    const confirm = useConfirm()
    const [loading, setLoading] = useState(false)



    const onRegenerate = ()=>{
        confirm({
            description: "Do you want to regenerate?",
            confirmationText: "Yes, Regenerate"
            
        }).then((e)=>{
            if(e.confirmed){
                setLoading(true)
                mutate.regenerateAiData.mutateAsync()
                    .then(()=>setLoading(false))
            }
        })  
    }


    return <>
        {loading && <BackdropLoader />}
        <EditAiData data={row.aiData} id={row.id} setData={()=>{}} reviewed={row.aiReviewed}/>
        <IconButton onClick={onRegenerate}> 
            <AutoAwesome />
        </IconButton>
        <DeleteButton id={row.id} />
    </>
}

export default ActionsCell